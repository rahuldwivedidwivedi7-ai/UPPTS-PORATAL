const mysql = require('mysql2/promise');

(async () => {
  const c = await mysql.createConnection('mysql://root:root@127.0.0.1:3306/upp_ts_transfers');
  
  try {
    await c.query(`
      ALTER TABLE users 
      MODIFY COLUMN role ENUM('COMPUTER_OPERATOR', 'DISTRICT_SP', 'SP_COMPUTER_CENTRE', 'IG_TECHNICAL_SERVICES', 'HQ_REVIEWER', 'ADG_TECHNICAL_SERVICES', 'ADMIN', 'SUPERVISOR', 'SP', 'IG', 'HQ', 'SUPER_ADMIN') NOT NULL DEFAULT 'COMPUTER_OPERATOR'
    `);
    
    // Add columns if they don't exist
    const [cols] = await c.query("SHOW COLUMNS FROM users");
    const colNames = cols.map(c => c.Field);
    
    if (!colNames.includes('reporting_authority_user_id')) {
      await c.query('ALTER TABLE users ADD COLUMN reporting_authority_user_id VARCHAR(36) NULL');
      await c.query('ALTER TABLE users ADD CONSTRAINT fk_reporting_authority FOREIGN KEY (reporting_authority_user_id) REFERENCES users(user_id) ON DELETE SET NULL');
    }
    
    if (!colNames.includes('deleted_at')) {
      await c.query('ALTER TABLE users ADD COLUMN deleted_at DATETIME NULL');
    }
    
    console.log('Migration successful');
  } catch (e) {
    console.error(e);
  } finally {
    c.end();
  }
})();
