import app from './app.js';
import { env } from './config/env.js';
import db from './config/db.js';

const startServer = async () => {
  try {
    // 1. Validate PostgreSQL connection pool on startup
    await db.testConnection();

    // 2. Listen on port
    app.listen(env.PORT, () => {
      console.log(`🚀 Server is listening at http://localhost:${env.PORT}`);
      console.log(`🔧 Environment: ${env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('❌ Server startup aborted due to critical error:', error);
    process.exit(1);
  }
};

startServer();
