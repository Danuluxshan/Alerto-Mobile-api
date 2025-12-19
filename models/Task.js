// models/Task.js
import mongoose from 'mongoose';

const reportMessageEntrySchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  alertType: {
    type: String,
    enum: ['true', 'false'],
    required: true,
  },
  reviewed_time: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

const taskSchema = new mongoose.Schema({
  threat_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Threat',
    required: true,
  },
  user_ids: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  review_status: {
    type: Boolean,
    default: false,
  },
  report_message: {
    type: [reportMessageEntrySchema],
    default: null,
  },
}, {
  timestamps: true,
});

const Task = mongoose.model('Task', taskSchema);

export default Task;

