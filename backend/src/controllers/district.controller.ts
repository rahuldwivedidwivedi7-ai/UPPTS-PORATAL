import { Request, Response, NextFunction } from 'express';
import districtRepository from '../repositories/district.repository.js';

export const districtController = {
  /**
   * GET /districts
   */
  async getDistricts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const districts = await districtRepository.findAll();
      
      res.status(200).json({
        success: true,
        message: 'Districts list retrieved successfully.',
        data: districts
      });
    } catch (error) {
      next(error);
    }
  }
};
export default districtController;
