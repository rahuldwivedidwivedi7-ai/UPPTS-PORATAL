import { Pool, PoolClient } from 'pg';
import { env } from './env.js';

// Configure pool to allow PostgreSQL connection pooling
const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const db = {
  /**
   * Execute a single query with parameters
   */
  async query<T = any>(
    text: string,
    params?: any[]
  ): Promise<{ rows: T[], insertId?: number }> {
    const start = Date.now();
    try {
      // Postgres parameter translation: ? -> $1, $2
      let index = 1;
      const pgText = text.replace(/\?/g, () => `$${index++}`);

      // Handle backticks specifically used in the project for table names and 'rank'
      const sanitizedText = pgText.replace(/`/g, '"');

      const res = await pool.query(sanitizedText, params);
      const duration = Date.now() - start;
      if (env.NODE_ENV === 'development') {
        // console.log('Executed query', { text: sanitizedText, duration });
      }
      return { 
        rows: res.rows as T[],
        insertId: undefined // Postgres uses RETURNING for insertId; handled differently.
      };
    } catch (error) {
      console.error('Database query execution failed:', { text, error });
      throw error;
    }
  },

  /**
   * Get a client connection from the pool for transactions
   */
  async getClient(): Promise<PoolClient & { beginTransaction: () => Promise<void>; commit: () => Promise<void>; rollback: () => Promise<void>; }> {
    const client = await pool.connect();
    
    // Polyfill mysql2 transaction methods to keep app working without rewriting logic
    const clientWrapper = Object.assign(client, {
      beginTransaction: async () => { await client.query('BEGIN'); },
      commit: async () => { await client.query('COMMIT'); },
      rollback: async () => { await client.query('ROLLBACK'); }
    });

    // Override query to translate params on the client wrapper too
    const originalQuery = clientWrapper.query.bind(clientWrapper);
    (clientWrapper as any).query = async function (text: any, params?: any[]) {
      if (typeof text === 'string') {
        let index = 1;
        text = text.replace(/\?/g, () => `$${index++}`).replace(/`/g, '"');
      }
      return originalQuery(text, params) as any;
    };

    return clientWrapper;
  },

  /**
   * Test pool connection
   */
  async testConnection(): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('SELECT 1');
      console.log('✅ PostgreSQL Database (Supabase) connected successfully.');
    } finally {
      client.release();
    }
  },

  /**
   * Shutdown pool
   */
  async close(): Promise<void> {
    await pool.end();
    console.log('PostgreSQL database pool closed.');
  }
};

export default db;
