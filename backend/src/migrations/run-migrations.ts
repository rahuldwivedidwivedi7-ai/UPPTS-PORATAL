import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  console.log('🔄 Starting database migrations...');
  const schemaPath = path.join(__dirname, 'schema.sql');
  
  try {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Connect to the DB
    await db.testConnection();
    
    console.log('⏳ Executing schema.sql...');
    const statements = schemaSql.split(';').filter(stmt => stmt.trim().length > 0);
    for (const stmt of statements) {
      await db.query(stmt);
    }
    console.log('✅ Database migrations completed successfully.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database migrations failed:', error);
    process.exit(1);
  }
}

runMigrations();
