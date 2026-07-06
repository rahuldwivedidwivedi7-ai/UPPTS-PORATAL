import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config(); // load .env file

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set in environment variables');
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();

  console.log('Resetting public schema...');
  // Wipe the public schema clean in postgres
  await client.query('DROP SCHEMA public CASCADE');
  await client.query('CREATE SCHEMA public');
  await client.query('GRANT ALL ON SCHEMA public TO postgres');
  await client.query('GRANT ALL ON SCHEMA public TO public');

  console.log('Applying schema...');
  const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  // Split on ; isn't perfectly robust for complex functions, but works for basic DDL
  const schemaStmts = schemaSql.split(';').filter(stmt => stmt.trim().length > 0);
  for (const stmt of schemaStmts) {
    await client.query(stmt);
  }

  console.log('Seeding data...');
  const seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
  // Mock seed SQL might contain backticks from MySQL, sanitize them just in case
  const sanitizedSeedSql = seedSql.replace(/`/g, '"');
  const seedStmts = sanitizedSeedSql.split(';').filter(stmt => stmt.trim().length > 0);
  for (const stmt of seedStmts) {
    await client.query(stmt);
  }

  await client.end();
  console.log('Database reset, schema applied, and seeded successfully.');
}

run().catch(console.error);
