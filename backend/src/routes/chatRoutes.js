const express = require('express');
const { check } = require('express-validator');
const chatController = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all routes
router.use(protect);

// @route   GET /api/chat/conversations
// @desc    Get all conversations for current user
// @access  Private
router.get('/conversations', chatController.getConversations);

// @route   POST /api/chat/conversations
// @desc    Get or create conversation with another user
// @access  Private
router.post(
  '/conversations',
  [
    check('userId', 'User ID is required').not().isEmpty()
  ],
  chatController.createConversation
);

// @route   GET /api/chat/conversations/:id/messages
// @desc    Get messages for a conversation
// @access  Private
router.get('/conversations/:id/messages', chatController.getMessages);

// @route   POST /api/chat/conversations/:id/messages
// @desc    Send a message in a conversation
// @access  Private
router.post(
  '/conversations/:id/messages',
  [
    check('content', 'Message content is required').not().isEmpty()
  ],
  chatController.sendMessage
);

// @route   PUT /api/chat/conversations/:id/read
// @desc    Mark conversation as read
// @access  Private
router.put('/conversations/:id/read', chatController.markAsRead);

// @route   POST /api/chat/users/status
// @desc    Get users' online status
// @access  Private
router.post(
  '/users/status',
  [
    check('userIds', 'User IDs must be an array').isArray()
  ],
  chatController.getUsersStatus
);

module.exports = router;