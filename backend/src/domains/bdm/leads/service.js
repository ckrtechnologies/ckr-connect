import crypto from 'crypto';
import { bdmLeadsRepository } from './repository.js';
import { adminLeadsService } from '../../admin/leads/service.js';

const parseDocuments = (brd_url, fallbackDate) => {
  if (!brd_url) return [];
  try {
    if (brd_url.startsWith('[')) {
      return JSON.parse(brd_url);
    }
  } catch {}
  return [{
    id: 'doc-initial',
    name: brd_url.split('/').pop(),
    url: brd_url,
    size: 0,
    uploaded_at: fallbackDate || new Date().toISOString()
  }];
};

export const bdmLeadsService = {
  async createLead(bdmId, leadData) {
    return await adminLeadsService.createLead({
      ...leadData,
      assigned_to: bdmId,
      source: leadData.source || 'bdm_inbound'
    }, bdmId);
  },

  async listMyLeads(bdmId, queryParams) {
    const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(queryParams.limit, 10) || 25));

    const filters = {
      status: queryParams.status,
      tag_id: queryParams.tag_id,
      search: queryParams.search,
      page,
      limit,
      sort_by: queryParams.sort_by || 'created_at',
      sort_order: queryParams.sort_order || 'DESC'
    };

    const items = await bdmLeadsRepository.findAssignedLeads(bdmId, filters);
    const total = await bdmLeadsRepository.countAssignedLeads(bdmId, filters);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  async getMyLeadById(bdmId, id) {
    const lead = await bdmLeadsRepository.findByIdAndBdm(id, bdmId);
    if (!lead) {
      const err = new Error('Lead not found or not assigned to your account');
      err.statusCode = 404;
      err.code = 'LEAD_NOT_FOUND';
      throw err;
    }
    const docs = parseDocuments(lead.brd_url, lead.created_at);
    return {
      ...lead,
      documents: docs,
      brd_url: docs.length > 0 ? docs[docs.length - 1].url : lead.brd_url
    };
  },

  async attachBrd(bdmId, id, file) {
    const existing = await bdmLeadsRepository.findByIdAndBdm(id, bdmId);
    if (!existing) {
      const err = new Error('Lead not found or not assigned to your account');
      err.statusCode = 404;
      err.code = 'LEAD_NOT_FOUND';
      throw err;
    }
    if (!file) {
      const err = new Error('No file uploaded');
      err.statusCode = 400;
      err.code = 'FILE_REQUIRED';
      throw err;
    }

    const relativePath = file.path.replace(/\\/g, '/');
    const docs = parseDocuments(existing.brd_url, existing.created_at);
    const newDoc = {
      id: crypto.randomUUID(),
      name: file.originalname || file.filename,
      url: relativePath,
      size: file.size,
      uploaded_at: new Date().toISOString()
    };
    docs.push(newDoc);

    const updated = await bdmLeadsRepository.attachBrd(
      id,
      bdmId,
      JSON.stringify(docs)
    );
    return {
      ...updated,
      documents: docs,
      brd_url: relativePath
    };
  },

  async deleteDocument(bdmId, id, docId) {
    const existing = await bdmLeadsRepository.findByIdAndBdm(id, bdmId);
    if (!existing) {
      const err = new Error('Lead not found or not assigned to your account');
      err.statusCode = 404;
      err.code = 'LEAD_NOT_FOUND';
      throw err;
    }
    const docs = parseDocuments(existing.brd_url, existing.created_at).filter((d) => d.id !== docId);
    const updated = await bdmLeadsRepository.attachBrd(
      id,
      bdmId,
      docs.length > 0 ? JSON.stringify(docs) : null
    );
    return {
      ...updated,
      documents: docs,
      brd_url: docs.length > 0 ? docs[docs.length - 1].url : null
    };
  },

  async updateStatus(bdmId, id, status, lostReason, invalidReason, wonAmount, nextFollowupDate, remarks) {
    const existing = await bdmLeadsRepository.findByIdAndBdm(id, bdmId);
    if (!existing) {
      const err = new Error('Lead not found or not assigned to your account');
      err.statusCode = 404;
      err.code = 'LEAD_NOT_FOUND';
      throw err;
    }

    const terminalStatuses = ['won', 'lost', 'invalid'];
    const normalizedStatus = (status || '').toLowerCase().trim();

    // Mandatory Next Follow-up Date validation matching Admin Panel (docs/AGENTS.md & UI rule)
    const effectiveFollowup = nextFollowupDate !== undefined ? nextFollowupDate : existing.next_followup_date;
    if (!terminalStatuses.includes(normalizedStatus) && (!effectiveFollowup || !String(effectiveFollowup).trim())) {
      const err = new Error('A Next Follow-up Date/Time is mandatory before saving lead status.');
      err.statusCode = 400;
      err.code = 'FOLLOWUP_DATE_REQUIRED';
      throw err;
    }

    if (normalizedStatus === 'lost' && (!lostReason || !lostReason.trim())) {
      const err = new Error('Lost reason is required when marking lead as Lost');
      err.statusCode = 400;
      err.code = 'LOST_REASON_REQUIRED';
      throw err;
    }

    if (normalizedStatus === 'invalid' && (!invalidReason || !invalidReason.trim())) {
      const err = new Error('Invalid reason is required when marking lead as Invalid');
      err.statusCode = 400;
      err.code = 'INVALID_REASON_REQUIRED';
      throw err;
    }

    if (normalizedStatus === 'won' && (!wonAmount || wonAmount <= 0)) {
      const err = new Error('Won amount is required when marking lead as Won');
      err.statusCode = 400;
      err.code = 'WON_AMOUNT_REQUIRED';
      throw err;
    }

    return await bdmLeadsRepository.updateStatus(
      id,
      bdmId,
      normalizedStatus,
      lostReason,
      invalidReason,
      wonAmount,
      effectiveFollowup,
      remarks
    );
  },

  async updateDetails(bdmId, id, updateData) {
    const lead = await bdmLeadsRepository.findByIdAndBdm(id, bdmId);
    if (!lead) {
      const err = new Error('Lead not found or access denied');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }

    if (['won', 'lost', 'invalid'].includes(lead.status)) {
      const err = new Error('Cannot edit details of a closed lead');
      err.statusCode = 403;
      err.code = 'LEAD_CLOSED';
      throw err;
    }

    const updatedLead = await bdmLeadsRepository.updateDetails(id, bdmId, updateData);
    return updatedLead;
  }
};
