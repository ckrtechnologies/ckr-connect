import { errorResponse } from '../utils/response.js';

/**
 * Global Express error handling middleware.
 * Ensures consistent response envelope on all unexpected server exceptions.
 */
export const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  const code = err.code || 'INTERNAL_ERROR';

  return errorResponse(res, message, code, statusCode);
};
