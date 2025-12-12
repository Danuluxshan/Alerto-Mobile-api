// models/SupportLegal.js
import mongoose from 'mongoose';

const supportLegalSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['about', 'privacy_policy', 'terms_of_service'],
    required: true,
    unique: true
  },
  // For About content
  paragraphs: {
    type: [String],
    required: false
  },
  // For Privacy Policy and Terms of Service
  introduction: {
    type: String,
    required: false
  },
  // For Privacy Policy
  sections: [{
    title: String,
    bullets: [String]
  }],
  // For Terms of Service
  terms: [{
    title: String,
    description: String
  }]
}, {
  timestamps: true
});

const SupportLegal = mongoose.model('SupportLegal', supportLegalSchema);

export default SupportLegal;