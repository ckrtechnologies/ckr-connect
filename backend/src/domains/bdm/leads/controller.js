import fs from 'fs';
import path from 'path';
import { secrets } from '../../../config/secrets.js';
import { bdmLeadsService } from './service.js';
import { successResponse } from '../../../utils/response.js';

export const bdmLeadsController = {
  async listMyLeads(req, res, next) {
    try {
      const data = await bdmLeadsService.listMyLeads(req.user.id, req.query);
      return successResponse(res, data, 'Leads retrieved');
    } catch (err) {
      next(err);
    }
  },

  async createLead(req, res, next) {
    try {
      const data = await bdmLeadsService.createLead(req.user.id, req.body);
      return successResponse(res, data, 'Lead created successfully', 201);
    } catch (err) {
      next(err);
    }
  },

  async getMyLeadById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await bdmLeadsService.getMyLeadById(req.user.id, id);
      return successResponse(res, data, 'Lead detail retrieved');
    } catch (err) {
      next(err);
    }
  },

  async uploadBrd(req, res, next) {
    try {
      const { id } = req.params;
      let targetFile = req.file;

      if (!targetFile && (req.body?.file_name || req.body?.file_content || req.body?.scope_text)) {
        const uploadDir = path.join(secrets.files.dir, 'brd', id);
        fs.mkdirSync(uploadDir, { recursive: true });
        const cleanName = (req.body.file_name || 'Project_Scope_BRD.txt').replace(/[^a-zA-Z0-9._-]/g, '_');
        const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${cleanName}`;
        const targetPath = path.join(uploadDir, uniqueFilename);

        const content = req.body.file_content || 
`=============================================================
CKR TECHNOLOGIES - CLIENT BUSINESS REQUIREMENTS DOCUMENT (BRD)
=============================================================
Lead ID: ${id}
Uploaded At: ${new Date().toISOString()}
Document Title: ${req.body.title || cleanName}
Scope Summary:
${req.body.scope_text || 'Standard project deliverables and architecture specifications.'}
=============================================================`;

        fs.writeFileSync(targetPath, content, 'utf8');
        const stats = fs.statSync(targetPath);
        targetFile = {
          path: targetPath,
          originalname: cleanName,
          filename: uniqueFilename,
          size: stats.size
        };
      }

      if (!targetFile) {
        const err = new Error('No document file or scope content was provided');
        err.statusCode = 400;
        err.code = 'NO_FILE';
        throw err;
      }

      const data = await bdmLeadsService.attachBrd(req.user.id, id, targetFile);
      return successResponse(res, data, 'BRD document uploaded and attached to lead', 201);
    } catch (err) {
      next(err);
    }
  },

  async deleteDocument(req, res, next) {
    try {
      const { id, docId } = req.params;
      const data = await bdmLeadsService.deleteDocument(req.user.id, id, docId);
      return successResponse(res, data, 'Attached document removed from lead');
    } catch (err) {
      next(err);
    }
  },

  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, lost_reason, invalid_reason, won_amount, next_followup_date, remarks } = req.body;
      const data = await bdmLeadsService.updateStatus(
        req.user.id,
        id,
        status,
        lost_reason,
        invalid_reason,
        won_amount,
        next_followup_date,
        remarks
      );
      return successResponse(res, data, 'Lead status updated');
    } catch (err) {
      next(err);
    }
  },

  async updateDetails(req, res, next) {
    try {
      const { id } = req.params;
      const data = await bdmLeadsService.updateDetails(req.user.id, id, req.body);
      return successResponse(res, data, 'Lead details updated successfully');
    } catch (err) {
      next(err);
    }
  }
};
