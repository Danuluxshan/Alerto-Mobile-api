// controllers/userController.js
import EmployeeActive from '../models/EmployeeActive.js';
import User from '../models/User.js';

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    // Get today's date (start of day for comparison)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);
    
    // Get all employee active records
    const employeeActiveRecords = await EmployeeActive.find()
      .populate('user_id', '_id')
      .sort({ createdAt: -1 });
    
    // Create a map of user_id to today's active status
    // Only records with active_status === true AND createdAt date is today should be considered active
    const activeStatusMap = new Map();
    
    employeeActiveRecords.forEach(emp => {
      const userId = emp.user_id._id ? emp.user_id._id.toString() : emp.user_id.toString();
      const createdAt = new Date(emp.createdAt);
      
      // Check if the record was created today (within today's date range)
      // AND has active_status === true
      if (createdAt >= today && createdAt <= todayEnd && emp.active_status === true) {
        // Only set if not already set (to get the most recent one if multiple exist)
        // This ensures we only mark as active if there's a true record created today
        if (!activeStatusMap.has(userId)) {
          activeStatusMap.set(userId, true);
        }
      }
    });
    
    // Format users to ensure consistent response structure
    const formattedUsers = users.map(user => {
      const userId = user._id.toString();
      // Get active status from employeesactives for today
      // Only true if there's a record for today with active_status === true
      // Default to false if no record or record is not active
      const activeStatus = activeStatusMap.get(userId) === true;
      
      return {
        _id: user._id.toString(),
        fullname: user.fullname || '',
        username: user.username || '',
        email: user.email || '',
        phonenumber: user.phonenumber || 0,
        role: user.role || 'employee',
        activeStatus: activeStatus, // From employeesactives table for today
        avatar: user.avatar || null,
        profile: user.avatar || null, // Alias for avatar for frontend compatibility
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    });
    
    res.json({
      success: true,
      data: formattedUsers,
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching users',
    });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Get today's date
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
    
    // Ensure all required fields are present and properly formatted
    const userData = {
      _id: user._id.toString(),
      fullname: user.fullname || '',
      username: user.username || '',
      email: user.email || '',
      phonenumber: user.phonenumber || 0,
      role: user.role || 'employee',
      activeStatus: activeStatus, // From employeesactives table for today
      avatar: user.avatar || null,
      profile: user.avatar || null, // Alias for avatar for frontend compatibility
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.json({
      success: true,
      data: userData,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching user',
    });
  }
};

// Create user
export const createUser = async (req, res) => {
  try {
    const { fullname, username, email, phonenumber, password, role } = req.body;

    // Validate required fields
    if (!fullname || !username || !email || !phonenumber || !password) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email or username already exists',
      });
    }

    // Hash password
    const bcrypt = (await import('bcryptjs')).default;
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      fullname,
      username,
      email: email.toLowerCase(),
      phonenumber,
      password: hashedPassword,
      role: role || 'employee',
    });

    await user.save();

    // Create EmployeeActive entry (default to false, user will activate themselves)
    const employeeActive = new EmployeeActive({
      user_id: user._id,
      active_status: false,
    });
    await employeeActive.save();

    // Return user without password
    const userData = {
      id: user._id,
      fullname: user.fullname,
      username: user.username,
      email: user.email,
      phonenumber: user.phonenumber,
      role: user.role,
      activeStatus: false, // From employeesactives (default false)
      avatar: user.avatar || null,
      profile: user.avatar || null, // Alias for avatar for frontend compatibility
    };

    res.status(201).json({
      success: true,
      data: userData,
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      error: 'Error creating user',
    });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullname, username, email, phonenumber, role } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Update fields (activeStatus is no longer in User model)
    if (fullname) user.fullname = fullname;
    if (username) user.username = username;
    if (email) user.email = email.toLowerCase();
    if (phonenumber !== undefined) user.phonenumber = phonenumber;
    if (role) user.role = role;
    if (req.body.avatar !== undefined) user.avatar = req.body.avatar; // Allow null to clear avatar

    await user.save();

    // Get today's date for active status
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);
    
    // Get employee active status for today - check all records and find one created today
    const employeeActiveRecords = await EmployeeActive.find({ user_id: id })
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

    const userData = {
      id: user._id,
      fullname: user.fullname,
      username: user.username,
      email: user.email,
      phonenumber: user.phonenumber,
      role: user.role,
      activeStatus: activeStatus, // From employeesactives table for today
      avatar: user.avatar || null,
      profile: user.avatar || null, // Alias for avatar for frontend compatibility
    };

    res.json({
      success: true,
      data: userData,
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating user',
    });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Delete EmployeeActive entry
    await EmployeeActive.findOneAndDelete({ user_id: id });

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: 'Error deleting user',
    });
  }
};

// Get active employees (only those with active_status: true)
export const getActiveEmployees = async (req, res) => {
  try {
    const activeEmployees = await EmployeeActive.find({ active_status: true })
      .populate('user_id', 'fullname username email phonenumber role')
      .select('-password');

    res.json({
      success: true,
      data: activeEmployees.map(emp => ({
        _id: emp._id.toString(),
        user_id: emp.user_id,
        active_status: emp.active_status,
        createdat: emp.createdAt,
        updatedat: emp.updatedAt,
      })),
    });
  } catch (error) {
    console.error('Get active employees error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching active employees',
    });
  }
};

// Get all employee active records (for status checking)
export const getAllEmployeeActive = async (req, res) => {
  try {
    const allEmployeeActive = await EmployeeActive.find()
      .populate('user_id', 'fullname username email phonenumber role')
      .select('-password')
      .sort({ updatedAt: -1 }); // Sort by most recent first

    res.json({
      success: true,
      data: allEmployeeActive.map(emp => ({
        _id: emp._id.toString(),
        user_id: emp.user_id,
        active_status: emp.active_status,
        createdat: emp.createdAt,
        updatedat: emp.updatedAt,
      })),
    });
  } catch (error) {
    console.error('Get all employee active error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching employee active records',
    });
  }
};

// Register FCM token for a user
export const registerFCMToken = async (req, res) => {
  try {
    const { userId, fcmToken } = req.body;

    if (!userId || !fcmToken) {
      return res.status(400).json({
        success: false,
        error: 'User ID and FCM token are required',
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Initialize fcmTokens array if it doesn't exist
    if (!user.fcmTokens) {
      user.fcmTokens = [];
    }

    // Add token if it doesn't already exist (avoid duplicates)
    if (!user.fcmTokens.includes(fcmToken)) {
      user.fcmTokens.push(fcmToken);
      await user.save();
      console.log(`✅ FCM token registered for user ${userId}`);
    } else {
      console.log(`ℹ️  FCM token already exists for user ${userId}`);
    }

    res.json({
      success: true,
      message: 'FCM token registered successfully',
    });
  } catch (error) {
    console.error('Register FCM token error:', error);
    res.status(500).json({
      success: false,
      error: 'Error registering FCM token',
    });
  }
};

// Update FCM token for a user (same as register, but can be used for updates)
export const updateFCMToken = async (req, res) => {
  try {
    const { userId, fcmToken } = req.body;

    if (!userId || !fcmToken) {
      return res.status(400).json({
        success: false,
        error: 'User ID and FCM token are required',
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Initialize fcmTokens array if it doesn't exist
    if (!user.fcmTokens) {
      user.fcmTokens = [];
    }

    // Remove old token if exists and add new one
    // This allows updating tokens when app is reinstalled
    user.fcmTokens = user.fcmTokens.filter(token => token !== fcmToken);
    user.fcmTokens.push(fcmToken);
    
    await user.save();
    console.log(`✅ FCM token updated for user ${userId}`);

    res.json({
      success: true,
      message: 'FCM token updated successfully',
    });
  } catch (error) {
    console.error('Update FCM token error:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating FCM token',
    });
  }
};
