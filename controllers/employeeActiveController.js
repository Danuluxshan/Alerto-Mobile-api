// controllers/employeeActiveController.js
import EmployeeActive from '../models/EmployeeActive.js';

// Create a new active record (always creates new record, never updates)
export const createActiveRecord = async (req, res) => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required',
      });
    }

    // Always create a new record with active_status: true
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
    res.status(500).json({
      success: false,
      error: 'Error creating active record',
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

// Get current active status for a user (most recent record)
export const getCurrentStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required',
      });
    }

    // Find the most recent record for this user
    const mostRecentRecord = await EmployeeActive.findOne({ user_id: userId })
      .sort({ createdAt: -1 });

    if (!mostRecentRecord) {
      return res.json({
        success: true,
        data: {
          active_status: false,
          hasRecord: false,
        },
      });
    }

    res.json({
      success: true,
      data: {
        _id: mostRecentRecord._id.toString(),
        user_id: mostRecentRecord.user_id.toString(),
        active_status: mostRecentRecord.active_status,
        createdAt: mostRecentRecord.createdAt,
        updatedAt: mostRecentRecord.updatedAt,
        hasRecord: true,
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

