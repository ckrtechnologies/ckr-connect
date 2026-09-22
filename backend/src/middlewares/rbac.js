import { errorResponse } from '../utils/response.js';

/**
 * Role-Based Access Control Middleware.
 * Enforces role guards per docs/API.md and docs/AGENTS.md.
 * @param {'admin' | 'bdm' | 'any'} allowedRole 
 */
export const requireRole = (allowedRoles = 'any') => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required', 'UNAUTHORIZED', 401);
    }

    if (allowedRoles === 'any') {
      return next();
    }

    const rolesList = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!rolesList.includes(req.user.role)) {
      return errorResponse(
        res,
        `Access denied. Role "${req.user.role}" does not have permission for this resource.`,
        'FORBIDDEN',
        403
      );
    }

    next();
  };
};
