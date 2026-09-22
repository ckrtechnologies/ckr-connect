import fs from 'fs';
import path from 'path';
import { mediaRepository } from './repository.js';

export const mediaService = {
  async getBrdStream(leadId, user) {
    const lead = await mediaRepository.getLeadBrdInfo(leadId);
    if (!lead) {
      const err = new Error('Lead not found');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }

    // Role check: BDM can only download BRD if assigned to them; Admin can download any
    if (user.role === 'bdm' && lead.assigned_to !== user.id) {
      const err = new Error('Unauthorized to access this lead document');
      err.statusCode = 403;
      err.code = 'FORBIDDEN';
      throw err;
    }

    if (!lead.brd_url) {
      const err = new Error('No BRD document uploaded for this lead');
      err.statusCode = 404;
      err.code = 'FILE_NOT_FOUND';
      throw err;
    }

    const filePath = path.resolve(process.cwd(), lead.brd_url);
    if (!fs.existsSync(filePath)) {
      const err = new Error('Physical document file not found on server storage');
      err.statusCode = 404;
      err.code = 'FILE_MISSING_ON_DISK';
      throw err;
    }

    return {
      filePath,
      fileName: path.basename(filePath)
    };
  }
};
