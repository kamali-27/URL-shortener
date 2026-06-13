const mongoose = require('mongoose');

const VisitSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  ip: {
    type: String,
    default: 'Unknown'
  },
  userAgent: {
    type: String,
    default: 'Unknown'
  },
  device: {
    type: String,
    default: 'Desktop'
  }
});

const UrlSchema = new mongoose.Schema({
  longUrl: {
    type: String,
    required: [true, 'Long URL is required'],
    trim: true
  },
  shortCode: {
    type: String,
    required: [true, 'Short code is required'],
    unique: true,
    trim: true,
    index: true
  },
  customAlias: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    index: true
  },
  clicks: {
    type: Number,
    default: 0
  },
  expiresAt: {
    type: Date,
    default: null
  },
  visits: [VisitSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Url', UrlSchema);
