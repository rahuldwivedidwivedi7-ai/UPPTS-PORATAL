import { Request, Response, NextFunction } from 'express';
import personnelRepository from '../repositories/personnel.repository.js';
import { UnauthorizedError, NotFoundError } from '../utils/custom-error.js';

export const personnelController = {
  /**
   * GET /personnel/profile
   */
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.personnel_id) {
        throw new UnauthorizedError('Administrative users do not possess standard operator profiles.');
      }

      const profile = await personnelRepository.findByPersonnelId(req.user.personnel_id);
      if (!profile) {
        throw new NotFoundError('Operator profile record not found.');
      }

      res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully.',
        data: {
          personnel_id: profile.personnel_id,
          pno: profile.pno,
          name: profile.name,
          grade: profile.grade,
          designation: profile.designation,
          date_of_birth: profile.date_of_birth.toISOString().split('T')[0],
          joining_date: profile.joining_date.toISOString().split('T')[0],
          mobile_number: profile.mobile_number,
          email: profile.email,
          home_district: {
            district_id: profile.home_district_id,
            district_name: profile.home_district_name,
            district_code: profile.home_district_code
          },
          current_district: {
            district_id: profile.current_district_id,
            district_name: profile.current_district_name,
            district_code: profile.current_district_code
          },
          current_posting: profile.current_posting
        }
      });
    } catch (error) {
      next(error);
    }
  }
};
export default personnelController;
