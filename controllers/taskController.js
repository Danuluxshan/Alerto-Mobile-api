// controllers/taskController.js
import Task from '../models/Task.js';
import Threat from '../models/Threat.js';
import User from '../models/User.js';
import { sendTaskAssignmentNotification, sendStaffResponseNotification } from '../services/notificationService.js';

// Get all tasks
export const getAllTasks = async (req, res) => {
  try {
    const { user_id, threat_id, review_status } = req.query;
    
    let query = {};
    if (user_id) {
      query.user_ids = user_id;
    }
    if (threat_id) {
      query.threat_id = threat_id;
    }
    if (review_status !== undefined) {
      query.review_status = review_status === 'true';
    }

    const tasks = await Task.find(query)
      .populate('threat_id')
      .populate('user_ids', 'fullname username email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching tasks',
    });
  }
};

// Get task by ID
export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('threat_id')
      .populate('user_ids', 'fullname username email');

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
      });
    }

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching task',
    });
  }
};

// Get tasks by user ID
export const getTasksByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find tasks where userId is in the user_ids array
    const tasks = await Task.find({ user_ids: userId })
      .populate('threat_id')
      .populate('user_ids', 'fullname username email')
      .sort({ createdAt: -1 });

    // Ensure we always return an array, even if empty
    res.json({
      success: true,
      data: Array.isArray(tasks) ? tasks : [],
    });
  } catch (error) {
    console.error('Get tasks by user error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching user tasks',
      data: [], // Ensure data is always an array
    });
  }
};

// Create task (assign threat to employees)
export const createTask = async (req, res) => {
  try {
    const { threat_id, user_ids } = req.body;

    if (!threat_id || !user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Threat ID and user IDs array are required',
      });
    }

    // Verify threat exists
    const threat = await Threat.findById(threat_id);
    if (!threat) {
      return res.status(404).json({
        success: false,
        error: 'Threat not found',
      });
    }

    // Remove existing tasks for this threat (for reassignment)
    await Task.deleteMany({ threat_id });

    // Create new task
    const task = new Task({
      threat_id,
      user_ids,
      review_status: false,
      report_message: null,
    });

    await task.save();

    // Update threat status to assigned
    threat.threat_status = true;
    await threat.save();

    const populatedTask = await Task.findById(task._id)
      .populate('threat_id')
      .populate('user_ids', 'fullname username email');

    // Send push notifications to assigned staff members (non-blocking)
    try {
      // Get camera details for notification
      const Camera = (await import('../models/Camera.js')).default;
      const camera = await Camera.findById(threat.camera_id);
      const cameraName = camera ? camera.name : 'Unknown Camera';
      const cameraLocation = camera ? camera.location : '';

      // Send notifications asynchronously (don't wait for it)
      sendTaskAssignmentNotification(
        user_ids,
        task._id.toString(),
        threat.threat_type || 'Alert',
        cameraName,
        cameraLocation
      ).catch(error => {
        console.error('Error sending task assignment notification:', error);
        // Don't fail the request if notification fails
      });
    } catch (notificationError) {
      console.error('Error setting up task assignment notification:', notificationError);
      // Don't fail the request if notification setup fails
    }

    res.status(201).json({
      success: true,
      data: populatedTask,
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      error: 'Error creating task',
    });
  }
};

// Update task (submit report)
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { review_status, report_message } = req.body;

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
      });
    }

    if (review_status !== undefined) {
      task.review_status = review_status;
    }

    let latestResponse = null;
    let responseStaffUser = null;
    
    if (report_message !== undefined) {
      if (review_status === true && report_message && Array.isArray(report_message)) {
        // Ensure each report message entry has reviewed_time
        const processedMessages = report_message.map((msg) => ({
          user_id: msg.user_id,
          message: msg.message,
          reviewed_time: msg.reviewed_time ? new Date(msg.reviewed_time) : new Date(),
        }));
        
        task.report_message = processedMessages;
        
        // Get the latest response for notification
        if (processedMessages.length > 0) {
          latestResponse = processedMessages[processedMessages.length - 1];
        }
      } else {
        task.report_message = null;
      }
    }

    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('threat_id')
      .populate('user_ids', 'fullname username email');

    // Send push notification to admins when staff responds
    if (latestResponse && review_status === true) {
      try {
        // Get staff user details
        responseStaffUser = await User.findById(latestResponse.user_id).select('fullname username');
        const staffName = responseStaffUser ? (responseStaffUser.fullname || responseStaffUser.username) : 'Staff';

        // Get threat and camera details
        const threat = await Threat.findById(task.threat_id);
        if (threat) {
          const Camera = (await import('../models/Camera.js')).default;
          const camera = await Camera.findById(threat.camera_id);
          const cameraName = camera ? camera.name : 'Unknown Camera';

          // Send notifications to admins asynchronously (don't wait for it)
          sendStaffResponseNotification(
            staffName,
            cameraName,
            latestResponse.message,
            task._id.toString(),
            latestResponse.reviewed_time
          ).catch(error => {
            console.error('Error sending staff response notification:', error);
            // Don't fail the request if notification fails
          });
        }
      } catch (notificationError) {
        console.error('Error setting up staff response notification:', notificationError);
        // Don't fail the request if notification setup fails
      }
    }

    res.json({
      success: true,
      data: populatedTask,
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating task',
    });
  }
};

// Delete task
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
      });
    }

    res.json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      error: 'Error deleting task',
    });
  }
};

