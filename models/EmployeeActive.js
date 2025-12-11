// models/EmployeeActive.js
import mongoose from 'mongoose';

const employeeActiveSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  active_status: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

const EmployeeActive = mongoose.model('EmployeeActive', employeeActiveSchema);

export default EmployeeActive;

