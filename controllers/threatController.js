// controllers/threatController.js
import Threat from '../models/Threat.js';
import Camera from '../models/Camera.js';

// Get all threats
export const getAllThreats = async (req, res) => {
  try {
    const { threat_status, threat_level } = req.query;
    
    let query = {};
    if (threat_status !== undefined) {
      query.threat_status = threat_status === 'true';
    }
    if (threat_level) {
      query.threat_level = threat_level;
    }

    const threats = await Threat.find(query)
      .populate('camera_id', 'name location camera_status camera_view')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: threats,
    });
  } catch (error) {
    console.error('Get threats error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching threats',
    });
  }
};

// Get threat by ID
export const getThreatById = async (req, res) => {
  try {
    const threat = await Threat.findById(req.params.id)
      .populate('camera_id', 'name location camera_status camera_view');

    if (!threat) {
      return res.status(404).json({
        success: false,
        error: 'Threat not found',
      });
    }

    res.json({
      success: true,
      data: threat,
    });
  } catch (error) {
    console.error('Get threat error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching threat',
    });
  }
};

// Create threat
export const createThreat = async (req, res) => {
  try {
    const { camera_id, threat_type, threat_level, threat_status } = req.body;

    if (!camera_id || !threat_type || !threat_level) {
      return res.status(400).json({
        success: false,
        error: 'Camera ID, threat type, and threat level are required',
      });
    }

    // Verify camera exists
    const camera = await Camera.findById(camera_id);
    if (!camera) {
      return res.status(404).json({
        success: false,
        error: 'Camera not found',
      });
    }

    const threat = new Threat({
      camera_id,
      threat_type,
      threat_level,
      threat_status: threat_status !== undefined ? threat_status : false,
    });

    await threat.save();

    const populatedThreat = await Threat.findById(threat._id)
      .populate('camera_id', 'name location camera_status camera_view');

    res.status(201).json({
      success: true,
      data: populatedThreat,
    });
  } catch (error) {
    console.error('Create threat error:', error);
    res.status(500).json({
      success: false,
      error: 'Error creating threat',
    });
  }
};

// Update threat
export const updateThreat = async (req, res) => {
  try {
    const { id } = req.params;
    const { threat_type, threat_level, threat_status } = req.body;

    const threat = await Threat.findByIdAndUpdate(
      id,
      { threat_type, threat_level, threat_status },
      { new: true, runValidators: true }
    ).populate('camera_id', 'name location camera_status camera_view');

    if (!threat) {
      return res.status(404).json({
        success: false,
        error: 'Threat not found',
      });
    }

    res.json({
      success: true,
      data: threat,
    });
  } catch (error) {
    console.error('Update threat error:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating threat',
    });
  }
};

// Delete threat
export const deleteThreat = async (req, res) => {
  try {
    const threat = await Threat.findByIdAndDelete(req.params.id);

    if (!threat) {
      return res.status(404).json({
        success: false,
        error: 'Threat not found',
      });
    }

    res.json({
      success: true,
      message: 'Threat deleted successfully',
    });
  } catch (error) {
    console.error('Delete threat error:', error);
    res.status(500).json({
      success: false,
      error: 'Error deleting threat',
    });
  }
};

