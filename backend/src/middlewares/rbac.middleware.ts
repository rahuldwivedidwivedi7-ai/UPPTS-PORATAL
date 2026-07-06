import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../utils/custom-error.js';

/**
 * Restricts route access to specified administrative roles.
 */
export const authorizeRoles = (...allowedRoles: ('COMPUTER_OPERATOR' | 'DISTRICT_SP' | 'SP_COMPUTER_CENTRE' | 'ADG_TECHNICAL_SERVICES' | 'ADMIN' | 'SUPERVISOR' | 'SP' | 'IG' | 'HQ' | 'SUPER_ADMIN')[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError('Authentication required'));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new ForbiddenError(`Access denied: permissions restricted to [${allowedRoles.join(', ')}]`));
      return;
    }

    next();
  };
};
export default authorizeRoles;
