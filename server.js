// server.js
import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import employeeRoutes from './routes/employees.js';

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect MongoDB
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('❌ MONGO_URI is not defined in .env file');
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// Routes
app.use('/api/employees', employeeRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, error: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

