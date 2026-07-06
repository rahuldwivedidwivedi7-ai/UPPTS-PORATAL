import { Request, Response, NextFunction } from 'express';
import { Schema, ZodError } from 'zod';
import { AppError } from '../utils/custom-error.js';

export const validateRequest = (schema: Schema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Parse request body
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Extract validation messages
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));

        res.status(400).json({
          success: false,
          message: 'Request validation failed',
          errors: formattedErrors
        });
        return;
      }
      next(new AppError('Invalid request format', 400));
    }
  };
};
export default validateRequest;
