const express = require('express');
const { check } = require('express-validator');
const activityController = require('../controllers/activityController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all routes
router.use(protect);

// @route   GET /api/activities
// @desc    Get all activities
// @access  Private
router.get('/', activityController.getActivities);

// @route   GET /api/activities/user
// @desc    Get user's activities
// @access  Private
router.get('/user', activityController.getUserActivities);

// @route   POST /api/activities
// @desc    Create new activity
// @access  Private
router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('category', 'Category is required').isIn([
      'sports', 'gaming', 'study', 'dining', 'entertainment', 'other'
    ])
  ],
  activityController.createActivity
);

// @route   GET /api/activities/:id
// @desc    Get single activity
// @access  Private
router.get('/:id', activityController.getActivity);

// @route   PUT /api/activities/:id
// @desc    Update activity
// @access  Private (creator only)
router.put(
  '/:id',
  [
    check('name', 'Name is required').optional().not().isEmpty(),
    check('description', 'Description is required').optional().not().isEmpty(),
    check('category', 'Invalid category').optional().isIn([
      'sports', 'gaming', 'study', 'dining', 'entertainment', 'other'
    ])
  ],
  activityController.updateActivity
);

// @route   DELETE /api/activities/:id
// @desc    Delete activity
// @access  Private (creator only)
router.delete('/:id', activityController.deleteActivity);

// @route   POST /api/activities/:id/join
// @desc    Join activity
// @access  Private
router.post('/:id/join', activityController.joinActivity);

// @route   POST /api/activities/:id/leave
// @desc    Leave activity
// @access  Private
router.post('/:id/leave', activityController.leaveActivity);

// @route   GET /api/activities/:id/users
// @desc    Get active users for an activity
// @access  Private
router.get('/:id/users', activityController.getActiveUsers);

module.exports = router;