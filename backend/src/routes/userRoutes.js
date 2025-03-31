const express = require('express');
const { check } = require('express-validator');
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all routes
router.use(protect);

// Note: Order matters for routes
// Place more specific routes before generic ones

// @route   GET /api/users/online
// @desc    Get online users
// @access  Private
router.get('/online', userController.getOnlineUsers);

// @route   GET /api/users/search
// @desc    Search users
// @access  Private
router.get('/search', userController.searchUsers);

// @route   GET /api/users/suggestions
// @desc    Get user suggestions based on activities
// @access  Private
router.get('/suggestions', userController.getUserSuggestions);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put(
  '/profile',
  [
    check('name', 'Name is required').optional().not().isEmpty(),
    check('college', 'College name is required').optional().not().isEmpty(),
    check('bio').optional().isLength({ max: 250 }).withMessage('Bio must be at most 250 characters')
  ],
  userController.updateProfile
);

// @route   GET /api/users/:id
// @desc    Get user profile
// @access  Private
router.get('/:id', userController.getUserProfile);

module.exports = router;