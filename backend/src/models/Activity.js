const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide activity name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide activity description'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Please specify category'],
    enum: {
      values: ['sports', 'gaming', 'study', 'dining', 'entertainment', 'other'],
      message: '{VALUE} is not a supported category'
    }
  },
  location: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    default: ''
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  maxParticipants: {
    type: Number,
    default: 0 // 0 means unlimited
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for participant count
ActivitySchema.virtual('participantCount').get(function() {
  return this.participants.length;
});

// Virtual to check if activity is full
ActivitySchema.virtual('isFull').get(function() {
  if (this.maxParticipants === 0) return false;
  return this.participants.length >= this.maxParticipants;
});

// Method to add participant
ActivitySchema.methods.addParticipant = function(userId) {
  // Check if user is already a participant
  if (this.participants.includes(userId)) {
    return false;
  }
  
  // Check if activity is full
  if (this.maxParticipants > 0 && this.participants.length >= this.maxParticipants) {
    return false;
  }
  
  this.participants.push(userId);
  return true;
};

// Method to remove participant
ActivitySchema.methods.removeParticipant = function(userId) {
  const index = this.participants.indexOf(userId);
  if (index === -1) {
    return false;
  }
  
  this.participants.splice(index, 1);
  return true;
};

// Pre-save middleware to ensure creator is also a participant
ActivitySchema.pre('save', function(next) {
  if (this.isNew && this.creator && !this.participants.includes(this.creator)) {
    this.participants.push(this.creator);
  }
  next();
});

module.exports = mongoose.model('Activity', ActivitySchema);