// controllers/authController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import EmployeeActive from '../models/EmployeeActive.js';
import User from '../models/User.js';

// Generate JWT Token
const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Login
export const login = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email/Username and password are required',
      });
    }

    // Find user by email or username
    const user = await User.findOne({
      $or: [
        { email: emailOrUsername.toLowerCase() },
        { username: emailOrUsername },
      ],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    // Compare password (assuming passwords are hashed with bcrypt)
    // For now, simple comparison (you should hash passwords in production)
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Get today's date for active status
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);
    
    // Get employee active status for today - check all records and find one created today
    const employeeActiveRecords = await EmployeeActive.find({ user_id: user._id })
      .sort({ createdAt: -1 });
    
    let activeStatus = false;
    
    // Check if there's a record created today with active_status === true
    for (const emp of employeeActiveRecords) {
      const createdAt = new Date(emp.createdAt);
      // Check if the record was created today AND has active_status === true
      if (createdAt >= today && createdAt <= todayEnd && emp.active_status === true) {
        activeStatus = true;
        break; // Found today's active record, no need to check further
      }
    }

    // Return user data (without password)
    const userData = {
      id: user._id.toString(), // Ensure ID is a string
      fullname: user.fullname,
      username: user.username,
      email: user.email,
      phonenumber: user.phonenumber,
      role: user.role,
      activeStatus: activeStatus, // From employeesactives table for today
    };

    res.json({
      success: true,
      token,
      user: userData,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during login',
    });
  }
};

