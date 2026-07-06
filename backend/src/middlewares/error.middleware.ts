import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/custom-error.js';
import { env } from '../config/env.js';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors: any = undefined;

  // Handle custom AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // Handle PostgreSQL specific duplicate key errors
  if ((err as any).code === '23505') {
    statusCode = 409;
    message = 'Resource already exists.';
    // Extract duplicate field if possible
    const detail = (err as any).detail;
    if (detail) {
      message = `Conflict: ${detail}`;
    }
  }

  // Handle PostgreSQL specific foreign key violations
  if ((err as any).code === '23503') {
    statusCode = 400;
    message = 'Referential integrity violation. Referenced record does not exist or is active.';
  }

  // If in dev environment, log the stack trace
  if (env.NODE_ENV === 'development') {
    console.error(`[ERROR] ${req.method} ${req.path}`, err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
    ...(env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
};
export default errorHandler;
