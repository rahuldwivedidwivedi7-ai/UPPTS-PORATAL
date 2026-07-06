import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

(async () => {
  const c = await mysql.createConnection('mysql://root:root@127.0.0.1:3306/upp_ts_transfers');
  
  try {
    const passwordHash = await bcrypt.hash('password123', 10);
    
    const users = [
      {
        username: 'super_admin',
        role: 'SUPER_ADMIN',
        full_name: 'System Super Admin',
        email: 'superadmin@uppts.gov.in',
      },
      {
        username: 'hq_admin',
        role: 'HQ',
        full_name: 'HQ Review Officer',
        email: 'hq@uppts.gov.in',
      },
      {
        username: 'ig_lucknow_zone',
        role: 'IG',
        full_name: 'IG Lucknow Zone',
        email: 'ig.lucknow@uppts.gov.in',
      },
      {
        username: 'sp_lucknow',
        role: 'SP',
        full_name: 'SP Lucknow District',
        email: 'sp.lucknow@uppts.gov.in',
      },
      {
        username: 'supervisor_lucknow',
        role: 'SUPERVISOR',
        full_name: 'Office Admin Lucknow',
        email: 'supervisor.lucknow@uppts.gov.in',
      }
    ];

    let index = 1;
    for (const u of users) {
      // check if exists
      const [existing] = await c.query('SELECT user_id FROM users WHERE username = ?', [u.username]);
      if (existing.length > 0) {
        console.log(`User ${u.username} already exists`);
        index++;
        continue;
      }
      
      const userId = crypto.randomUUID();
      const mobileNumber = '9' + String(index).padStart(9, '0');
      
      // We will try inserting with personnel_id = NULL
      await c.query(`
        INSERT INTO users (
          user_id, personnel_id, district_id, username, pno_number, full_name, father_name, dob, gender, \`rank\`, posting_district, password_hash, email, mobile_number, role
        ) VALUES (?, NULL, NULL, ?, ?, ?, 'N/A', '1980-01-01', 'MALE', 'Admin', 'HQ', ?, ?, ?, ?)
      `, [userId, u.username, u.username, u.full_name, passwordHash, u.email, mobileNumber, u.role]);
      
      console.log(`Created user ${u.username} with role ${u.role}`);
      index++;
    }
  } catch (e) {
    console.error(e);
  } finally {
    c.end();
  }
})();
