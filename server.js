// server.js
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import connectDB from './config/database.js';

// Import routes
import authRoutes from './routes/auth.js';
import cameraRoutes from './routes/cameras.js';
import contactRoutes from './routes/contact.js';
import employeeActiveRoutes from './routes/employeeActive.js';
import notificationRoutes from './routes/notifications.js';
import supportLegalRoutes from './routes/supportLegal.js';
import taskRoutes from './routes/tasks.js';
import threatRoutes from './routes/threats.js';
import userRoutes from './routes/users.js';

// Load environment variables
dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*', // Allow all origins in development
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cameras', cameraRoutes);
app.use('/api/threats', threatRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/support-legal', supportLegalRoutes);
app.use('/api/employee-active', employeeActiveRoutes);
app.use('/api/contact', contactRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
});

