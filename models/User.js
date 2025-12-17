// models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true,
    trim: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  phonenumber: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'employee', 'superadmin'],
    default: 'employee',
  },
  avatar: {
    type: String,
    enum: ['boy', 'girl'],
    default: null,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt
});

const User = mongoose.model('User', userSchema);

export default User;

