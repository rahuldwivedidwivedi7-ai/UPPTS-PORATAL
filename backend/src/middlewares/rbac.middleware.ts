import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../utils/custom-error.js';

/**
 * Restricts route access to specified administrative roles.
 */
export const authorizeRoles = (...allowedRoles: ('SUPER_ADMIN' | 'APPLICANT' | 'DISTRICT_ADMIN' | 'DISTRICT_SP' | 'TS_UPCC_ADMIN' | 'TS_UPCC_SP' | 'TS_DIG_IG' | 'TSHQ_ADMIN' | 'ADG_TS')[]) => {
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
