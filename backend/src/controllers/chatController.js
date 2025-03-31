const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const { validationResult } = require('express-validator');

/**
 * @desc    Get all conversations for current user
 * @route   GET /api/chat/conversations
 * @access  Private
 */
exports.getConversations = async (req, res) => {
  try {
    // Find all conversations where the user is a participant
    const conversations = await Conversation.find({
      participants: req.user.id
    })
      .sort({ lastMessageTime: -1 })
      .populate('participants', 'name college avatar isOnline');
    
    // Format conversations to include unread count for current user
    const formattedConversations = conversations.map(conv => {
      const convObj = conv.toObject();
      convObj.unreadCount = conv.unreadCount.get(req.user.id.toString()) || 0;
      return convObj;
    });
    
    res.json({
      success: true,
      count: conversations.length,
      data: formattedConversations
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching conversations'
    });
  }
};

/**
 * @desc    Get or create conversation with another user
 * @route   POST /api/chat/conversations
 * @access  Private
 */
exports.createConversation = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { userId } = req.body;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user.id, userId] }
    }).populate('participants', 'name college avatar isOnline');
    
    if (conversation) {
      // Return existing conversation
      const convObj = conversation.toObject();
      convObj.unreadCount = conversation.unreadCount.get(req.user.id.toString()) || 0;
      
      return res.json({
        success: true,
        data: convObj
      });
    }
    
    // Create new conversation
    conversation = new Conversation({
      participants: [req.user.id, userId],
      unreadCount: {
        [req.user.id]: 0,
        [userId]: 0
      }
    });
    
    await conversation.save();
    
    // Fetch conversation with populated participants
    conversation = await Conversation.findById(conversation._id)
      .populate('participants', 'name college avatar isOnline');
    
    const convObj = conversation.toObject();
    convObj.unreadCount = 0;  // New conversation, no unread messages
    
    res.status(201).json({
      success: true,
      data: convObj
    });
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating conversation'
    });
  }
};

/**
 * @desc    Get messages for a conversation
 * @route   GET /api/chat/conversations/:id/messages
 * @access  Private
 */
exports.getMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 50, before } = req.query;
    
    // Check if conversation exists and user is a participant
    const conversation = await Conversation.findOne({
      _id: id,
      participants: req.user.id
    });
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found or you are not a participant'
      });
    }
    
    // Build query to get messages
    const query = { conversationId: id };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }
    
    // Get messages for the conversation
    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('sender', 'name avatar');
    
    // Mark messages as read
    const unreadMessages = messages.filter(
      msg => !msg.readBy.includes(req.user.id) && msg.sender.toString() !== req.user.id
    );
    
    if (unreadMessages.length > 0) {
      // Update each message's readBy array
      const messageUpdates = unreadMessages.map(msg => {
        msg.readBy.push(req.user.id);
        return msg.save();
      });
      
      await Promise.all(messageUpdates);
      
      // Update conversation unread count
      conversation.markAsRead(req.user.id);
      await conversation.save();
    }
    
    res.json({
      success: true,
      count: messages.length,
      data: messages.reverse() // Return in chronological order
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching messages'
    });
  }
};

/**
 * @desc    Send a message in a conversation
 * @route   POST /api/chat/conversations/:id/messages
 * @access  Private
 */
exports.sendMessage = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { id } = req.params;
    const { content } = req.body;
    
    // Check if conversation exists and user is a participant
    const conversation = await Conversation.findOne({
      _id: id,
      participants: req.user.id
    });
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found or you are not a participant'
      });
    }
    
    // Create new message
    const message = new Message({
      conversationId: id,
      sender: req.user.id,
      content,
      readBy: [req.user.id]  // Sender has read the message
    });
    
    await message.save();
    
    // Update conversation with last message info
    conversation.updateLastMessage(content);
    conversation.incrementUnreadCount(req.user.id);
    await conversation.save();
    
    // Populate sender info
    await message.populate('sender', 'name avatar');
    
    // Emit socket event if socket.io is available
    if (req.io) {
      // Get the other participant to send them the message
      const recipientId = conversation.participants.find(
        p => p.toString() !== req.user.id
      );
      
      if (recipientId) {
        req.io.to(recipientId.toString()).emit('message', message);
      }
    }
    
    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending message'
    });
  }
};

/**
 * @desc    Mark conversation as read
 * @route   PUT /api/chat/conversations/:id/read
 * @access  Private
 */
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if conversation exists and user is a participant
    const conversation = await Conversation.findOne({
      _id: id,
      participants: req.user.id
    });
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found or you are not a participant'
      });
    }
    
    // Mark unread messages as read
    const unreadMessages = await Message.find({
      conversationId: id,
      sender: { $ne: req.user.id },
      readBy: { $ne: req.user.id }
    });
    
    if (unreadMessages.length > 0) {
      // Update each message's readBy array
      const messageUpdates = unreadMessages.map(msg => {
        msg.readBy.push(req.user.id);
        return msg.save();
      });
      
      await Promise.all(messageUpdates);
    }
    
    // Update conversation unread count
    conversation.markAsRead(req.user.id);
    await conversation.save();
    
    res.json({
      success: true,
      message: 'Conversation marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while marking conversation as read'
    });
  }
};

/**
 * @desc    Get users' online status
 * @route   POST /api/chat/users/status
 * @access  Private
 */
exports.getUsersStatus = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { userIds } = req.body;
    
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User IDs must be a non-empty array'
      });
    }
    
    // Get users' online status
    const users = await User.find({
      _id: { $in: userIds }
    }).select('_id isOnline lastActive');
    
    // Create a map of user ID to online status
    const statusMap = {};
    users.forEach(user => {
      statusMap[user._id] = {
        isOnline: user.isOnline,
        lastActive: user.lastActive
      };
    });
    
    res.json({
      success: true,
      data: statusMap
    });
  } catch (error) {
    console.error('Get users status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users status'
    });
  }
};