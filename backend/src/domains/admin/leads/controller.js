import { adminLeadsService } from './service.js';
import { successResponse } from '../../../utils/response.js';

export const adminLeadsController = {
  async listLeads(req, res, next) {
    try {
      const data = await adminLeadsService.listLeads(req.query);
      return successResponse(res, data, 'Leads fetched successfully');
    } catch (err) {
      next(err);
    }
  },

  async getLeadById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await adminLeadsService.getLeadById(id);
      return successResponse(res, data, 'Lead detail fetched successfully');
    } catch (err) {
      next(err);
    }
  },

  async createLead(req, res, next) {
    try {
      const data = await adminLeadsService.createLead(req.body, req.user?.id);
      return successResponse(res, data, 'Lead created successfully', 201);
    } catch (err) {
      next(err);
    }
  },

  async updateLead(req, res, next) {
    try {
      const { id } = req.params;
      const data = await adminLeadsService.updateLead(id, req.body);
      return successResponse(res, data, 'Lead updated successfully');
    } catch (err) {
      next(err);
    }
  },

  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, lost_reason, invalid_reason, won_amount } = req.body;
      const data = await adminLeadsService.updateStatus(id, status, lost_reason, invalid_reason, won_amount);
      return successResponse(res, data, 'Lead status updated successfully');
    } catch (err) {
      next(err);
    }
  },

  
  async bulkDelete(req, res, next) {
    try {
      const { lead_ids } = req.body;
      const count = await adminLeadsService.bulkDelete(lead_ids);
      return successResponse(res, { count }, `Successfully deleted ${count} leads`);
    } catch (err) {
      next(err);
    }
  },

  async bulkTags(req, res, next) {
    try {
      const { lead_ids, tags_to_add, tags_to_remove } = req.body;
      const data = await adminLeadsService.bulkTags(lead_ids, tags_to_add, tags_to_remove);
      return successResponse(res, data, 'Tags updated successfully for selected leads');
    } catch (err) {
      next(err);
    }
  },

  async bulkAssign(req, res, next) {
    try {
      const { lead_ids } = req.body;
      const assigned_to = req.body.assigned_to || req.body.bdm_id;
      const data = await adminLeadsService.bulkAssign(lead_ids, assigned_to, req.user?.id);
      return successResponse(res, data, `${data.length} leads assigned successfully`);
    } catch (err) {
      next(err);
    }
  },

  async importCsv(req, res, next) {
    try {
      if (!req.file) {
        const err = new Error('CSV file is required');
        err.statusCode = 400;
        err.code = 'NO_FILE_UPLOADED';
        throw err;
      }
      const data = await adminLeadsService.importCsv(req.file.path, req.user.id);
      return successResponse(res, data, `Successfully imported ${data.count} leads from CSV`, 201);
    } catch (err) {
      next(err);
    }
  },

  async exportCsv(req, res, next) {
    try {
      const csvString = await adminLeadsService.exportCsv(req.query);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="leads-export-${Date.now()}.csv"`);
      return res.send(csvString);
    } catch (err) {
      next(err);
    }
  },

  async deleteLead(req, res, next) {
    try {
      const { id } = req.params;
      const data = await adminLeadsService.deleteLead(id);
      return successResponse(res, data, 'Lead deleted successfully');
    } catch (err) {
      next(err);
    }
  },

  async uploadBrd(req, res, next) {
    try {
      const { id } = req.params;
      const data = await adminLeadsService.uploadBrd(id, req.file);
      return successResponse(res, data, 'Document uploaded successfully');
    } catch (err) {
      next(err);
    }
  },

  async deleteDocument(req, res, next) {
    try {
      const { id, docId } = req.params;
      const data = await adminLeadsService.deleteDocument(id, docId);
      return successResponse(res, data, 'Document deleted successfully');
    } catch (err) {
      next(err);
    }
  }
};
