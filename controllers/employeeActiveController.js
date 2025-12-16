// controllers/employeeActiveController.js
import EmployeeActive from '../models/EmployeeActive.js';

// Create a new active record (ALWAYS creates new record, NEVER updates existing records)
// This allows employees to go Active → Inactive → Active multiple times
// Each activation creates a new record for history tracking
export const createActiveRecord = async (req, res) => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required',
      });
    }

    // ALWAYS create a NEW record with active_status: true
    // Do NOT check for existing records - always create new one
    // This allows re-activation after going inactive
    const employeeActive = new EmployeeActive({
      user_id,
      active_status: true,
    });

    await employeeActive.save();

    res.status(201).json({
      success: true,
      data: {
        _id: employeeActive._id.toString(),
        user_id: employeeActive.user_id.toString(),
        active_status: employeeActive.active_status,
        createdAt: employeeActive.createdAt,
        updatedAt: employeeActive.updatedAt,
      },
      message: 'Employee active record created successfully',
    });
  } catch (error) {
    console.error('Create active record error:', error);
    
    // Check for duplicate key error (unique index still exists)
    if (error.code === 11000 || error.name === 'MongoServerError') {
      console.error('❌ DUPLICATE KEY ERROR: Unique index on user_id still exists!');
      console.error('⚠️  Run the migration script to drop the index:');
      console.error('   node scripts/dropEmployeeActiveIndex.js');
      return res.status(500).json({
        success: false,
        error: 'Database constraint error: Unique index on user_id prevents multiple records. Please run the migration script to fix this.',
        details: 'Multiple activations require removing the unique index. See scripts/dropEmployeeActiveIndex.js',
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Error creating active record',
      details: error.message,
    });
  }
};

// Update to inactive (updates the most recent record for the user)
export const updateToInactive = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required',
      });
    }

    // Find the most recent record for this user (sorted by createdAt descending)
    const mostRecentRecord = await EmployeeActive.findOne({ user_id: userId })
      .sort({ createdAt: -1 });

    if (!mostRecentRecord) {
      // If no record exists, create one with inactive status
      const employeeActive = new EmployeeActive({
        user_id: userId,
        active_status: false,
      });
      await employeeActive.save();

      return res.json({
        success: true,
        data: {
          _id: employeeActive._id.toString(),
          user_id: employeeActive.user_id.toString(),
          active_status: employeeActive.active_status,
          createdAt: employeeActive.createdAt,
          updatedAt: employeeActive.updatedAt,
        },
        message: 'Employee inactive record created successfully',
      });
    }

    // Update the most recent record to inactive
    mostRecentRecord.active_status = false;
    await mostRecentRecord.save();

    res.json({
      success: true,
      data: {
        _id: mostRecentRecord._id.toString(),
        user_id: mostRecentRecord.user_id.toString(),
        active_status: mostRecentRecord.active_status,
        createdAt: mostRecentRecord.createdAt,
        updatedAt: mostRecentRecord.updatedAt,
      },
      message: 'Employee status updated to inactive successfully',
    });
  } catch (error) {
    console.error('Update to inactive error:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating to inactive',
    });
  }
};

// Get current active status for a user (check if active TODAY)
export const getCurrentStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required',
      });
    }

    // Get today's date range (start and end of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    // Find all records for this user, sorted by most recent first
    const allRecords = await EmployeeActive.find({ user_id: userId })
      .sort({ createdAt: -1 });

    if (!allRecords || allRecords.length === 0) {
      return res.json({
        success: true,
        data: {
          active_status: false,
          hasRecord: false,
          createdAt: null,
        },
      });
    }

    // Find the most recent record created TODAY
    const todayRecord = allRecords.find(record => {
      const createdAt = new Date(record.createdAt);
      return createdAt >= today && createdAt <= todayEnd;
    });

    // If there's a record for today, return its status
    if (todayRecord) {
      return res.json({
        success: true,
        data: {
          _id: todayRecord._id.toString(),
          user_id: todayRecord.user_id.toString(),
          active_status: todayRecord.active_status === true,
          createdAt: todayRecord.createdAt,
          updatedAt: todayRecord.updatedAt,
          hasRecord: true,
        },
      });
    }

    // No record for today - user is not active today
    // Return the most recent record info but with active_status: false
    const mostRecentRecord = allRecords[0];
    return res.json({
      success: true,
      data: {
        _id: mostRecentRecord._id.toString(),
        user_id: mostRecentRecord.user_id.toString(),
        active_status: false, // Not active today (record exists but not for today)
        createdAt: mostRecentRecord.createdAt,
        updatedAt: mostRecentRecord.updatedAt,
        hasRecord: true, // Has a record, but not for today
      },
    });
  } catch (error) {
    console.error('Get current status error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching current status',
    });
  }
};

