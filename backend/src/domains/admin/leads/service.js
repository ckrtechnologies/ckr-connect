import fs from 'fs';
import csvParser from 'csv-parser';
import { adminLeadsRepository } from './repository.js';
import { db } from '../../../db/index.js';

export const adminLeadsService = {
  async listLeads(queryParams) {
    const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(queryParams.limit, 10) || 25));

    const filters = {
      status: queryParams.status,
      source: queryParams.source,
      assigned_to: queryParams.assigned_to,
      tag_id: queryParams.tag_id,
      search: queryParams.search,
      page,
      limit,
      sort_by: queryParams.sort_by || 'created_at',
      sort_order: queryParams.sort_order || 'DESC'
    };

    const [leads, total] = await Promise.all([
      adminLeadsRepository.findFiltered(filters),
      adminLeadsRepository.countFiltered(filters)
    ]);

    return {
      items: leads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  async getLeadById(id) {
    const lead = await adminLeadsRepository.findById(id);
    if (!lead) {
      const err = new Error('Lead not found');
      err.statusCode = 404;
      err.code = 'LEAD_NOT_FOUND';
      throw err;
    }
    return lead;
  },

  async createLead(data, creatorUserId) {
    if (!data.tag_id) {
      const { rows } = await db.query('SELECT id FROM connect.tags WHERE is_active = true ORDER BY name ASC LIMIT 1');
      if (rows[0]) {
        data.tag_id = rows[0].id;
      }
    }
    return await adminLeadsRepository.create(data, creatorUserId);
  },

  async updateLead(id, data) {
    const existing = await adminLeadsRepository.findById(id);
    if (!existing) {
      const err = new Error('Lead not found');
      err.statusCode = 404;
      err.code = 'LEAD_NOT_FOUND';
      throw err;
    }
    return await adminLeadsRepository.update(id, data);
  },

  async updateStatus(id, status, lostReason, invalidReason, wonAmount) {
    const existing = await adminLeadsRepository.findById(id);
    if (!existing) {
      const err = new Error('Lead not found');
      err.statusCode = 404;
      err.code = 'LEAD_NOT_FOUND';
      throw err;
    }

    if (status === 'lost' && (!lostReason || !lostReason.trim())) {
      const err = new Error('Lost reason is mandatory when marking a lead as Lost');
      err.statusCode = 400;
      err.code = 'LOST_REASON_REQUIRED';
      throw err;
    }

    if (status === 'invalid' && (!invalidReason || !invalidReason.trim())) {
      const err = new Error('Invalid reason is mandatory when marking a lead as Invalid');
      err.statusCode = 400;
      err.code = 'INVALID_REASON_REQUIRED';
      throw err;
    }

    if (status === 'won' && (!wonAmount || wonAmount <= 0)) {
      const err = new Error('Won amount is mandatory when marking a lead as Won');
      err.statusCode = 400;
      err.code = 'WON_AMOUNT_REQUIRED';
      throw err;
    }

    return await adminLeadsRepository.updateStatus(id, status, lostReason, invalidReason, wonAmount);
  },

  async bulkAssign(leadIds, assignedTo, adminUserId) {
    const { rows } = await db.query(
      `SELECT id, name, is_active, role FROM connect.users WHERE id = $1`,
      [assignedTo]
    );

    if (!rows[0] || !rows[0].is_active) {
      const err = new Error('Target BDM is either not found or inactive');
      err.statusCode = 400;
      err.code = 'INVALID_BDM';
      throw err;
    }

    return await adminLeadsRepository.bulkAssign(leadIds, assignedTo, adminUserId);
  },

  async importCsv(filePath, creatorUserId) {
    const results = [];
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (data) => {
          const leadName = data.name || data.lead_name;
          const phone = data.phone;
          if (leadName && phone) {
            results.push({
              name: leadName.trim(),
              company_name: data.company_name ? data.company_name.trim() : 'Self',
              email: data.email ? data.email.trim() : null,
              phone: phone.trim(),
              city: data.city ? data.city.trim() : null,
              state: data.state ? data.state.trim() : null,
              source: data.source ? data.source.trim().toLowerCase() : 'website',
              expected_value: data.expected_value ? parseFloat(data.expected_value) : 0,
              assigned_to: data.assigned_to ? data.assigned_to.trim() : null
            });
          }
        })
        .on('end', async () => {
          try {
            if (results.length === 0) {
              const err = new Error('CSV file contains no valid rows with name/lead_name and phone');
              err.statusCode = 400;
              err.code = 'EMPTY_CSV';
              throw err;
            }
            const inserted = await adminLeadsRepository.batchCreate(results, creatorUserId);
            fs.unlink(filePath, () => {});
            resolve({ count: inserted.length, items: inserted });
          } catch (err) {
            fs.unlink(filePath, () => {});
            reject(err);
          }
        })
        .on('error', (err) => {
          fs.unlink(filePath, () => {});
          reject(err);
        });
    });
  },

  async exportCsv(filters) {
    const allLeads = await adminLeadsRepository.findFiltered({
      ...filters,
      page: 1,
      limit: 10000
    });

    const headers = [
      'Name',
      'Company',
      'Phone',
      'Email',
      'City',
      'State',
      'Source',
      'Status',
      'Priority',
      'Expected Value',
      'Won Amount',
      'Assigned BDM',
      'Created At'
    ];

    const rows = allLeads.map(l => [
      `"${(l.name || '').replace(/"/g, '""')}"`,
      `"${(l.company_name || '').replace(/"/g, '""')}"`,
      `"${l.phone || ''}"`,
      `"${l.email || ''}"`,
      `"${l.city || ''}"`,
      `"${l.state || ''}"`,
      `"${l.source || ''}"`,
      `"${l.status || ''}"`,
      `"${l.priority || ''}"`,
      l.expected_value || 0,
      l.won_amount || 0,
      `"${(l.assigned_bdm_name || 'Unassigned').replace(/"/g, '""')}"`,
      `"${l.created_at}"`
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
};
