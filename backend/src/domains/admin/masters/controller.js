import { adminMastersService } from './service.js';
import { successResponse } from '../../../utils/response.js';

export const adminMastersController = {
  // Tags
  async listTags(req, res, next) {
    try {
      const data = await adminMastersService.listTags();
      return successResponse(res, data, 'Tags retrieved');
    } catch (err) {
      next(err);
    }
  },

  async createTag(req, res, next) {
    try {
      const data = await adminMastersService.createTag(req.body);
      return successResponse(res, data, 'Tag created successfully', 201);
    } catch (err) {
      next(err);
    }
  },

  async updateTag(req, res, next) {
    try {
      const { id } = req.params;
      const data = await adminMastersService.updateTag(id, req.body);
      return successResponse(res, data, 'Tag updated successfully');
    } catch (err) {
      next(err);
    }
  },

  async deleteTag(req, res, next) {
    try {
      const { id } = req.params;
      const data = await adminMastersService.deleteTag(id);
      return successResponse(res, data, 'Tag deleted successfully');
    } catch (err) {
      next(err);
    }
  },

  // Holidays
  async listHolidays(req, res, next) {
    try {
      const year = req.query.year ? parseInt(req.query.year, 10) : undefined;
      const data = await adminMastersService.listHolidays(year);
      return successResponse(res, data, 'Holidays retrieved');
    } catch (err) {
      next(err);
    }
  },

  async createHoliday(req, res, next) {
    try {
      const data = await adminMastersService.createHoliday(req.body);
      return successResponse(res, data, 'Holiday created successfully', 201);
    } catch (err) {
      next(err);
    }
  },

  async updateHoliday(req, res, next) {
    try {
      const { id } = req.params;
      const data = await adminMastersService.updateHoliday(id, req.body);
      return successResponse(res, data, 'Holiday updated successfully');
    } catch (err) {
      next(err);
    }
  },

  async deleteHoliday(req, res, next) {
    try {
      const { id } = req.params;
      const data = await adminMastersService.deleteHoliday(id);
      return successResponse(res, data, 'Holiday deleted successfully');
    } catch (err) {
      next(err);
    }
  }
};
