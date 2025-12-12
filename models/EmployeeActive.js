// models/EmployeeActive.js
import mongoose from 'mongoose';

const employeeActiveSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    // Removed unique: true to allow multiple records (one per active/inactive cycle)
  },
  active_status: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

const EmployeeActive = mongoose.model('EmployeeActive', employeeActiveSchema);

export default EmployeeActive;

