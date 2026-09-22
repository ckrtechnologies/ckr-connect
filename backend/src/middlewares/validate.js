import { errorResponse } from '../utils/response.js';

/**
 * Express middleware to validate request payload (body, query, params) against Zod schemas.
 * Enforces rule: "Every route validates input with zod before touching the database."
 * @param {import('zod').ZodSchema} schema 
 * @param {'body' | 'query' | 'params'} [source='body']
 */
export const validate = (schema, source = 'body') => {
  return async (req, res, next) => {
    try {
      const parsed = await schema.parseAsync(req[source]);
      req[source] = parsed;
      next();
    } catch (err) {
      const message = err.errors ? err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ') : err.message;
      return errorResponse(res, message, 'VALIDATION_ERROR', 400);
    }
  };
};
