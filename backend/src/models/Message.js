const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Message content cannot be empty'],
    trim: true
  },
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Pre-save middleware to mark message as read by sender
MessageSchema.pre('save', function(next) {
  if (this.isNew && !this.readBy.includes(this.sender)) {
    this.readBy.push(this.sender);
  }
  next();
});

// Method to mark as read by a user
MessageSchema.methods.markAsReadBy = function(userId) {
  if (!userId || this.readBy.includes(userId)) return;
  
  this.readBy.push(userId);
};

module.exports = mongoose.model('Message', MessageSchema);