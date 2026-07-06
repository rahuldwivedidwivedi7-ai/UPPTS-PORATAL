import db from '../config/db.js';

export interface DistrictRow {
  district_id: string;
  district_name: string;
  district_code: string;
}

export const districtRepository = {
  /**
   * Fetch all registered districts sorted by name
   */
  async findAll(): Promise<DistrictRow[]> {
    const query = `
      SELECT district_id, district_name, district_code
      FROM districts
      ORDER BY district_name ASC
    `;
    const res = await db.query<DistrictRow>(query);
    return res.rows;
  }
};
export default districtRepository;
