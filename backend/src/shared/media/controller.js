import { mediaService } from './service.js';

export const mediaController = {
  async downloadBrd(req, res, next) {
    try {
      const { leadId } = req.params;
      const docId = req.query.doc_id || req.query.docId;
      const { filePath, fileName } = await mediaService.getBrdStream(leadId, req.user, docId);
      return res.download(filePath, fileName);
    } catch (err) {
      next(err);
    }
  }
};
