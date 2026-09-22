import jwt from 'jsonwebtoken';
import { secrets } from '../config/secrets.js';
import { errorResponse } from '../utils/response.js';

/**
 * Bearer JWT authentication middleware.
 * Attaches decoded user payload to req.user.
 */
export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 'Authentication token missing or invalid', 'UNAUTHORIZED', 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, secrets.jwt.secret);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return errorResponse(res, 'Session token expired, please log in again', 'TOKEN_EXPIRED', 401);
    }
    return errorResponse(res, 'Invalid token authorization', 'UNAUTHORIZED', 401);
  }
};
