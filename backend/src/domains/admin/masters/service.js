import { adminMastersRepository } from './repository.js';

export const adminMastersService = {
  // Tags
  async listTags() {
    return await adminMastersRepository.getAllTags();
  },

  async createTag(data) {
    const existing = await adminMastersRepository.findTagByName(data.name);
    if (existing) {
      const err = new Error('Tag with this name already exists');
      err.statusCode = 409;
      err.code = 'TAG_EXISTS';
      throw err;
    }
    return await adminMastersRepository.create(data);
  },

  async updateTag(id, data) {
    const existing = await adminMastersRepository.findTagById(id);
    if (!existing) {
      const err = new Error('Tag not found');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }
    return await adminMastersRepository.update(id, data);
  },

  async deleteTag(id) {
    const existing = await adminMastersRepository.findTagById(id);
    if (!existing) {
      const err = new Error('Tag not found');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }
    return await adminMastersRepository.deleteTag(id);
  },

  // Holidays
  async listHolidays(year) {
    return await adminMastersRepository.getAllHolidays(year);
  },

  async createHoliday(data) {
    const existing = await adminMastersRepository.findHolidayByDate(data.date);
    if (existing) {
      const err = new Error('A holiday is already registered on this date');
      err.statusCode = 409;
      err.code = 'HOLIDAY_EXISTS';
      throw err;
    }
    return await adminMastersRepository.create(data);
  },

  async updateHoliday(id, data) {
    const existing = await adminMastersRepository.findHolidayById(id);
    if (!existing) {
      const err = new Error('Holiday not found');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }
    return await adminMastersRepository.update(id, data);
  },

  async deleteHoliday(id) {
    const existing = await adminMastersRepository.findHolidayById(id);
    if (!existing) {
      const err = new Error('Holiday not found');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }
    return await adminMastersRepository.deleteHoliday(id);
  }
};
