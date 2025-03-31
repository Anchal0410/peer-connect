const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  lastMessage: {
    type: String,
    default: ''
  },
  lastMessageTime: {
    type: Date,
    default: Date.now
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to ensure unique conversations between participants
ConversationSchema.index({ participants: 1 });

// Method to mark as read for a user
ConversationSchema.methods.markAsRead = function(userId) {
  if (!userId) return;
  
  // Convert to string to ensure consistent map key format
  const userIdStr = userId.toString();
  
  this.unreadCount.set(userIdStr, 0);
};

// Method to increment unread count for all participants except sender
ConversationSchema.methods.incrementUnreadCount = function(senderId) {
  if (!senderId) return;
  
  // Convert to string to ensure consistent map key format
  const senderIdStr = senderId.toString();
  
  this.participants.forEach(participantId => {
    // Skip the sender
    if (participantId.toString() === senderIdStr) return;
    
    const participantIdStr = participantId.toString();
    const currentCount = this.unreadCount.get(participantIdStr) || 0;
    this.unreadCount.set(participantIdStr, currentCount + 1);
  });
};

// Method to update last message info
ConversationSchema.methods.updateLastMessage = function(messageContent) {
  this.lastMessage = messageContent;
  this.lastMessageTime = new Date();
};

module.exports = mongoose.model('Conversation', ConversationSchema);