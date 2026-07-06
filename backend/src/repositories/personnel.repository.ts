import db from '../config/db.js';

export interface PersonnelDetails {
  personnel_id: string;
  pno: string;
  name: string;
  grade: 'GRADE_A' | 'GRADE_B';
  designation: string;
  date_of_birth: Date;
  joining_date: Date;
  mobile_number: string;
  email: string;
  home_district_id: string;
  home_district_name: string;
  home_district_code: string;
  current_district_id: string;
  current_district_name: string;
  current_district_code: string;
  current_posting: string;
  status: string;
}

export const personnelRepository = {
  /**
   * Fetch detailed operator profile with joined home and current districts
   */
  async findByPersonnelId(personnelId: string): Promise<PersonnelDetails | null> {
    const query = `
      SELECT 
        p.personnel_id,
        p.pno,
        p.name,
        p.grade,
        p.designation,
        p.date_of_birth,
        p.joining_date,
        p.mobile_number,
        p.email,
        p.home_district_id,
        hd.district_name AS home_district_name,
        hd.district_code AS home_district_code,
        p.current_district_id,
        cd.district_name AS current_district_name,
        cd.district_code AS current_district_code,
        p.current_posting,
        p.status
      FROM personnel p
      JOIN districts hd ON p.home_district_id = hd.district_id
      JOIN districts cd ON p.current_district_id = cd.district_id
      WHERE p.personnel_id = ?
    `;
    const res = await db.query<PersonnelDetails>(query, [personnelId]);
    return res.rows[0] || null;
  }
};
export default personnelRepository;
