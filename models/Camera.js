// models/Camera.js
import mongoose from 'mongoose';

const cameraSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  camera_status: {
    type: Boolean,
  },
  camera_view: {
    type: String, // URL to video/image
    required: true,
  },
}, {
  timestamps: true,
});

const Camera = mongoose.model('Camera', cameraSchema);

export default Camera;

