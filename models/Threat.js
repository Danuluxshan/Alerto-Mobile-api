// models/Threat.js
import mongoose from 'mongoose';

const threatSchema = new mongoose.Schema({
  camera_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Camera',
    required: true,
  },
  threat_type: {
    type: String,
    required: true,
    trim: true,
  },
  threat_level: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    required: true,
  },
  threat_status: {
    type: Boolean,
    default: false, // false = unreviewed/unassigned, true = assigned
  },
}, {
  timestamps: true,
});

const Threat = mongoose.model('Threat', threatSchema);

export default Threat;

