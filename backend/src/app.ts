import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import errorHandler from './middlewares/error.middleware.js';
import authRoutes from './routes/auth.routes.js';
import personnelRoutes from './routes/personnel.routes.js';
import districtRoutes from './routes/district.routes.js';
import transferRoutes from './routes/transfer.routes.js';
import approvalRoutes from './routes/approval.routes.js';
import adminRoutes from './routes/admin.routes.js';
import profileRoutes from './routes/profile.routes.js';
import userManagementRoutes from './routes/user-management.routes.js';

const app = express();

// Standard Express Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false // Allows frontend to fetch files from static server
}));
app.use(cors());   // Enables CORS
app.use(express.json()); // Parses application/json

// Serve static documents uploads
app.use('/uploads', express.static(path.resolve('uploads')));

// Baseline API routing mounts
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/personnel', personnelRoutes);
app.use('/api/v1/districts', districtRoutes);
app.use('/api/v1/transfer-requests', transferRoutes);
app.use('/api/v1/approvals', approvalRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/users', userManagementRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Technical Services Headquarters Transfer System API is healthy.',
    timestamp: new Date().toISOString()
  });
});

// Centralized error handling middleware
app.use(errorHandler);

export default app;
