import { Request, Response, NextFunction } from 'express';
import jwtUtil from '../utils/jwt.util.js';
import { UnauthorizedError } from '../utils/custom-error.js';

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authentication token missing or invalid');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedError('Authentication token missing');
    }

    const decoded = jwtUtil.verifyToken(token);
    
    // Attach decoded user info to request object
    req.user = {
      user_id: decoded.user_id,
      username: decoded.username,
      role: decoded.role as any,
      personnel_id: decoded.personnel_id,
      district_id: decoded.district_id,
    };

    next();
  } catch (error) {
    next(new UnauthorizedError('Session expired or invalid authentication token'));
  }
};
export default authMiddleware;
