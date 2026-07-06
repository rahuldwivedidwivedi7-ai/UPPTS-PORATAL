import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSeed() {
  console.log('🌱 Starting database seeding...');
  const seedPath = path.join(__dirname, 'seed.sql');
  
  try {
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    
    // Connect to the DB
    await db.testConnection();
    
    console.log('⏳ Executing seed.sql...');
    const statements = seedSql.split(';').filter(stmt => stmt.trim().length > 0);
    for (const stmt of statements) {
      await db.query(stmt);
    }
    console.log('✅ Database seeding completed successfully.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
}

runSeed();
