import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import userRepository from '../repositories/user.repository.js';
import { db } from '../config/db.js';
import ExcelJS from 'exceljs';

export const userManagementController = {
  /**
   * Get all users with filters
   */
  async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const { role, status, district_id, search } = req.query;
      
      const filters = {
        role: role as string,
        status: status as string,
        district_id: district_id as string,
        search: search as string
      };

      const users = await userRepository.findUsers(filters);
      
      // Remove password hash from results
      const safeUsers = users.map(u => {
        const { password_hash, ...rest } = u;
        return rest;
      });

      res.status(200).json({
        success: true,
        data: safeUsers
      });
    } catch (error: any) {
      console.error('Error fetching users:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  /**
   * Create a new authority/user
   */
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const { 
        full_name, pno_number, username, password, email, mobile_number, 
        designation, role, district_id, reporting_authority_user_id, rank
      } = req.body;

      // 1. Validation
      if (!username || !password || !role) {
        res.status(400).json({ success: false, message: 'Username, password, and role are required' });
        return;
      }

      // Check if username exists
      const existingUser = await userRepository.findByUsername(username);
      if (existingUser) {
        res.status(409).json({ success: false, message: 'Username already exists' });
        return;
      }

      // 2. Hash password
      const password_hash = await bcrypt.hash(password, 10);
      
      // Generate IDs
      const userId = crypto.randomUUID();
      const personnelId = crypto.randomUUID();

      // 3. Start Transaction
      const conn = await db.getClient();
      await conn.beginTransaction();

      try {
        // Create user record directly without personnel record
        const userQuery = `
          INSERT INTO users (
            user_id, personnel_id, district_id, username, pno_number, full_name, father_name, dob, gender, \`rank\`, posting_district, password_hash, email, mobile_number, role, reporting_authority_user_id, force_password_change
          ) VALUES (?, NULL, ?, ?, NULL, ?, NULL, NULL, NULL, ?, ?, ?, ?, ?, ?, ?, TRUE)
        `;
        
        await conn.query(userQuery, [
          userId, district_id || null, username, 
          full_name, designation || rank || role, district_id || 'HQ', password_hash, 
          email, mobile_number, role, reporting_authority_user_id || null
        ]);

        await conn.commit();

        // Send Welcome Email
        import('../services/email.service.js').then(module => {
          module.sendWelcomeEmail(email, full_name, username, password).catch(e => {
            console.error('Failed to send email async:', e);
          });
        }).catch(e => console.error('Failed to load email service:', e));

        res.status(201).json({
          success: true,
          message: 'User created successfully. Credentials sent via email.',
          data: { user_id: userId, username, role }
        });
      } catch (err) {
        await conn.rollback();
        throw err;
      } finally {
        conn.release();
      }
    } catch (error: any) {
      console.error('Error creating user:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  /**
   * Edit user details
   */
  async editUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { full_name, role, district_id, reporting_authority_user_id, email, mobile_number, status } = req.body;

      const user = await userRepository.findById(id);
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      await userRepository.updateProfile(id, {
        full_name, role, district_id, reporting_authority_user_id, email, mobile_number, status
      });

      res.status(200).json({ success: true, message: 'User updated successfully' });
    } catch (error: any) {
      console.error('Error updating user:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  /**
   * Reset user password
   */
  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { new_password } = req.body;

      if (!new_password) {
        res.status(400).json({ success: false, message: 'New password is required' });
        return;
      }

      const passwordHash = await bcrypt.hash(new_password, 10);
      await userRepository.updatePassword(id, passwordHash);

      res.status(200).json({ success: true, message: 'Password reset successfully' });
    } catch (error: any) {
      console.error('Error resetting password:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  /**
   * Soft Delete User
   */
  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await userRepository.softDelete(id);
      res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting user:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  /**
   * Export all users to Excel
   */
  async exportUsers(req: Request, res: Response): Promise<void> {
    try {
      const { role, status, district_id, search } = req.query;
      const filters = {
        role: role as string,
        status: status as string,
        district_id: district_id as string,
        search: search as string
      };

      const users = await userRepository.findUsers(filters);

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Users');

      worksheet.columns = [
        { header: 'Full Name', key: 'full_name', width: 25 },
        { header: 'Username', key: 'username', width: 20 },
        { header: 'PNO', key: 'pno_number', width: 15 },
        { header: 'Role', key: 'role', width: 20 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'District ID', key: 'district_id', width: 20 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Mobile', key: 'mobile_number', width: 20 },
        { header: 'Reporting Authority', key: 'reporting_authority_user_id', width: 40 },
      ];

      users.forEach(u => {
        worksheet.addRow({
          full_name: u.full_name,
          username: u.username,
          pno_number: u.pno_number,
          role: u.role,
          status: u.status,
          district_id: u.district_id,
          email: u.email,
          mobile_number: u.mobile_number,
          reporting_authority_user_id: u.reporting_authority_user_id
        });
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=users_export.xlsx');
      
      await workbook.xlsx.write(res);
      res.end();
    } catch (error: any) {
      console.error('Error exporting users:', error);
      res.status(500).json({ success: false, message: 'Failed to export users' });
    }
  },

  /**
   * Download blank import template
   */
  async downloadTemplate(req: Request, res: Response): Promise<void> {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Template');

      worksheet.columns = [
        { header: 'Full Name (Required)', key: 'full_name', width: 25 },
        { header: 'Username (Required)', key: 'username', width: 20 },
        { header: 'Password (Required)', key: 'password', width: 20 },
        { header: 'PNO Number', key: 'pno_number', width: 15 },
        { header: 'Role (Required)', key: 'role', width: 20 },
        { header: 'District Code', key: 'district_id', width: 20 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Mobile Number', key: 'mobile_number', width: 20 },
        { header: 'Reporting Authority (Username)', key: 'reporting_authority_username', width: 35 },
      ];

      // Add a sample row
      worksheet.addRow({
        full_name: 'John Doe',
        username: 'john_doe123',
        password: 'Password123',
        pno_number: '123456789',
        role: 'SUPERVISOR',
        district_id: 'LKO',
        email: 'john@upp.gov.in',
        mobile_number: '9876543210',
        reporting_authority_username: 'ig_lucknow_zone'
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=user_import_template.xlsx');
      
      await workbook.xlsx.write(res);
      res.end();
    } catch (error: any) {
      console.error('Error downloading template:', error);
      res.status(500).json({ success: false, message: 'Failed to download template' });
    }
  },

  /**
   * Parse and validate Excel file
   */
  async previewImport(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: 'No file uploaded' });
        return;
      }

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(req.file.buffer as any);
      const worksheet = workbook.worksheets[0];

      if (!worksheet) {
        res.status(400).json({ success: false, message: 'Excel file is empty' });
        return;
      }

      const rows: any[] = [];
      const extractCell = (val: any) => {
        if (!val) return '';
        if (typeof val === 'object' && val.text) return val.text.toString().trim();
        return val.toString().trim();
      };

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // skip header
        
        const rowValues = row.values as any[];
        // row.values is 1-indexed in exceljs
        rows.push({
          row: rowNumber,
          full_name: extractCell(rowValues[1]),
          username: extractCell(rowValues[2]),
          password: extractCell(rowValues[3]),
          pno_number: extractCell(rowValues[4]),
          role: extractCell(rowValues[5]),
          district_id: extractCell(rowValues[6]),
          email: extractCell(rowValues[7]),
          mobile_number: extractCell(rowValues[8]),
          reporting_authority_username: extractCell(rowValues[9])
        });
      });

      // Validation
      const validRecords: any[] = [];
      const invalidRecords: any[] = [];
      
      const conn = await db.getClient();
      try {
        const allowedRoles = ['SUPER_ADMIN', 'APPLICANT', 'DISTRICT_ADMIN', 'DISTRICT_SP', 'TS_UPCC_ADMIN', 'TS_UPCC_SP', 'TS_DIG_IG', 'TSHQ_ADMIN', 'ADG_TS'];

        for (const data of rows) {
          const errors: string[] = [];

          if (!data.full_name) errors.push('Full Name is required');
          if (!data.username) errors.push('Username is required');
          if (!data.password) errors.push('Password is required');
          if (!data.role) errors.push('Role is required');
          else if (!allowedRoles.includes(data.role)) errors.push(`Invalid role: ${data.role}`);

          let reporting_authority_user_id: string | null = null;

          if (errors.length === 0) {
            // Check username uniqueness
            const [existing] = await conn.query('SELECT user_id FROM users WHERE username = ?', [data.username]) as any;
            if (existing.length > 0) {
              errors.push(`Username '${data.username}' already exists`);
            }

            // Check PNO uniqueness if provided
            if (data.pno_number) {
              const [existingPno] = await conn.query('SELECT user_id FROM users WHERE pno_number = ?', [data.pno_number]) as any;
              if (existingPno.length > 0) {
                errors.push(`PNO '${data.pno_number}' already exists`);
              }
            }

            // Lookup reporting authority if provided
            if (data.reporting_authority_username) {
              const [repAuth] = await conn.query('SELECT user_id FROM users WHERE username = ?', [data.reporting_authority_username]) as any;
              if (repAuth.length > 0) {
                reporting_authority_user_id = repAuth[0].user_id;
              } else {
                errors.push(`Reporting Authority '${data.reporting_authority_username}' not found`);
              }
            }

            // Validate district_id if provided
            if (data.district_id && data.district_id !== 'HQ') {
              const [existingDist] = await conn.query('SELECT district_id FROM districts WHERE district_id = ?', [data.district_id]) as any;
              if (existingDist.length === 0) {
                errors.push(`District ID '${data.district_id}' is invalid`);
              }
            }
          }

          if (errors.length > 0) {
            invalidRecords.push({ ...data, errors });
          } else {
            validRecords.push({ ...data, reporting_authority_user_id });
          }
        }
      } finally {
        conn.release();
      }

      res.status(200).json({
        success: true,
        data: {
          total: rows.length,
          validCount: validRecords.length,
          invalidCount: invalidRecords.length,
          validRecords,
          invalidRecords
        }
      });
    } catch (error: any) {
      console.error('Error previewing import:', error);
      res.status(500).json({ success: false, message: 'Failed to process Excel file' });
    }
  },

  /**
   * Confirm import and bulk insert
   */
  async confirmImport(req: Request, res: Response): Promise<void> {
    try {
      const { validRecords } = req.body;

      if (!validRecords || !Array.isArray(validRecords) || validRecords.length === 0) {
        res.status(400).json({ success: false, message: 'No valid records provided for import' });
        return;
      }

      const conn = await db.getClient();
      await conn.beginTransaction();

      try {
        let insertedCount = 0;
        for (const record of validRecords) {
          const userId = crypto.randomUUID();
          const passwordHash = await bcrypt.hash(record.password, 10);
          const pno = record.pno_number || record.username;
          const fallbackEmail = record.email || `${record.username}@upp.gov.in`;
          const fallbackMobile = record.mobile_number || Math.floor(1000000000 + Math.random() * 9000000000).toString();

          const query = `
            INSERT INTO users (
              user_id, personnel_id, district_id, username, pno_number, full_name, father_name, dob, gender, \`rank\`, 
              posting_district, password_hash, email, mobile_number, role, reporting_authority_user_id
            ) VALUES (?, NULL, ?, ?, ?, ?, 'N/A', '1980-01-01', 'MALE', ?, ?, ?, ?, ?, ?, ?)
          `;

          await conn.query(query, [
            userId, record.district_id || null, record.username, pno, record.full_name,
            record.role, record.district_id || 'HQ', passwordHash, fallbackEmail, fallbackMobile,
            record.role, record.reporting_authority_user_id || null
          ]);
          insertedCount++;
        }

        // Audit Log
        const logId = crypto.randomUUID();
        const auditQuery = `
          INSERT INTO audit_logs (log_id, user_id, action, details, ip_address)
          VALUES (?, ?, 'BULK_USER_IMPORT', ?, ?)
        `;
        await conn.query(auditQuery, [
          logId, req.user?.user_id || null, 
          `Successfully imported ${insertedCount} users`, 
          req.ip || '127.0.0.1'
        ]);

        await conn.commit();
        res.status(200).json({ success: true, message: `Successfully imported ${insertedCount} users` });
      } catch (err) {
        await conn.rollback();
        throw err;
      } finally {
        conn.release();
      }
    } catch (error: any) {
      console.error('Error confirming import:', error);
      res.status(500).json({ success: false, message: 'Internal server error during import' });
    }
  }
};
