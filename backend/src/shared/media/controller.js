import { mediaService } from './service.js';

export const mediaController = {
  async downloadBrd(req, res, next) {
    try {
      const { leadId } = req.params;
      const { filePath, fileName } = await mediaService.getBrdStream(leadId, req.user);
      return res.download(filePath, fileName);
    } catch (err) {
      next(err);
    }
  }
};
