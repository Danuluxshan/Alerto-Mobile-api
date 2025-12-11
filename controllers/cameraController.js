// controllers/cameraController.js
import Camera from '../models/Camera.js';

// Get all cameras
export const getAllCameras = async (req, res) => {
  try {
    const cameras = await Camera.find();
    res.json({
      success: true,
      data: cameras,
    });
  } catch (error) {
    console.error('Get cameras error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching cameras',
    });
  }
};

// Get camera by ID
export const getCameraById = async (req, res) => {
  try {
    const camera = await Camera.findById(req.params.id);
    
    if (!camera) {
      return res.status(404).json({
        success: false,
        error: 'Camera not found',
      });
    }

    res.json({
      success: true,
      data: camera,
    });
  } catch (error) {
    console.error('Get camera error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching camera',
    });
  }
};

// Create camera
export const createCamera = async (req, res) => {
  try {
    const { name, location, camera_status, camera_view } = req.body;

    if (!name || !location || !camera_view) {
      return res.status(400).json({
        success: false,
        error: 'Name, location, and camera_view are required',
      });
    }

    const camera = new Camera({
      name,
      location,
      camera_status: camera_status !== undefined ? camera_status : true,
      camera_view,
    });

    await camera.save();

    res.status(201).json({
      success: true,
      data: camera,
    });
  } catch (error) {
    console.error('Create camera error:', error);
    res.status(500).json({
      success: false,
      error: 'Error creating camera',
    });
  }
};

// Update camera
export const updateCamera = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, camera_status, camera_view } = req.body;

    const camera = await Camera.findByIdAndUpdate(
      id,
      { name, location, camera_status, camera_view },
      { new: true, runValidators: true }
    );

    if (!camera) {
      return res.status(404).json({
        success: false,
        error: 'Camera not found',
      });
    }

    res.json({
      success: true,
      data: camera,
    });
  } catch (error) {
    console.error('Update camera error:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating camera',
    });
  }
};

// Delete camera
export const deleteCamera = async (req, res) => {
  try {
    const camera = await Camera.findByIdAndDelete(req.params.id);

    if (!camera) {
      return res.status(404).json({
        success: false,
        error: 'Camera not found',
      });
    }

    res.json({
      success: true,
      message: 'Camera deleted successfully',
    });
  } catch (error) {
    console.error('Delete camera error:', error);
    res.status(500).json({
      success: false,
      error: 'Error deleting camera',
    });
  }
};

