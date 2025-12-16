// models/EmployeeActive.js
import mongoose from 'mongoose';

const employeeActiveSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    // IMPORTANT: unique: false (or not set) to allow multiple records per user
    // This enables: Active → Inactive → Active cycles with history tracking
    // Each activation creates a NEW record, old records remain unchanged
  },
  active_status: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Explicitly prevent unique index on user_id
// This ensures multiple records per user are allowed
employeeActiveSchema.index({ user_id: 1 }, { unique: false });

const EmployeeActive = mongoose.model('EmployeeActive', employeeActiveSchema);

export default EmployeeActive;

