const Activity = require('../models/Activity');
const User = require('../models/User');
const { validationResult } = require('express-validator');

/**
 * @desc    Get all activities
 * @route   GET /api/activities
 * @access  Private
 */
exports.getActivities = async (req, res) => {
  try {
    // Parse query parameters
    const { category, limit = 20, page = 1 } = req.query;
    
    // Build filter object
    const filter = { isActive: true };
    if (category) filter.category = category;
    
    // Find activities with pagination
    const activities = await Activity.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('creator', 'name college avatar')
      .populate('participants', 'name college avatar isOnline');
    
    // Get total count for pagination
    const total = await Activity.countDocuments(filter);
    
    res.json({
      success: true,
      count: activities.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: activities
    });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching activities'
    });
  }
};

/**
 * @desc    Get single activity
 * @route   GET /api/activities/:id
 * @access  Private
 */
exports.getActivity = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id)
      .populate('creator', 'name college avatar')
      .populate('participants', 'name college avatar isOnline');
    
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }
    
    res.json({
      success: true,
      data: activity
    });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching activity'
    });
  }
};

/**
 * @desc    Create new activity
 * @route   POST /api/activities
 * @access  Private
 */
exports.createActivity = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { name, description, category, location, image, maxParticipants, startTime, endTime } = req.body;
    
    // Create activity
    const activity = new Activity({
      name,
      description,
      category,
      location,
      image: image || '',
      maxParticipants: maxParticipants || 0,
      startTime: startTime || null,
      endTime: endTime || null,
      creator: req.user.id,
      participants: [req.user.id] // Creator automatically joins
    });
    
    await activity.save();
    
    res.status(201).json({
      success: true,
      data: activity
    });
  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating activity'
    });
  }
};

/**
 * @desc    Update activity
 * @route   PUT /api/activities/:id
 * @access  Private (creator only)
 */
exports.updateActivity = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { name, description, category, location, image, maxParticipants, startTime, endTime, isActive } = req.body;
    
    // Find activity
    let activity = await Activity.findById(req.params.id);
    
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }
    
    // Check if user is creator
    if (activity.creator.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this activity'
      });
    }
    
    // Build update object
    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (category) updateData.category = category;
    if (location !== undefined) updateData.location = location;
    if (image !== undefined) updateData.image = image;
    if (maxParticipants !== undefined) updateData.maxParticipants = maxParticipants;
    if (startTime !== undefined) updateData.startTime = startTime;
    if (endTime !== undefined) updateData.endTime = endTime;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    // Update activity
    activity = await Activity.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('creator', 'name college avatar')
     .populate('participants', 'name college avatar isOnline');
    
    res.json({
      success: true,
      data: activity
    });
  } catch (error) {
    console.error('Update activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating activity'
    });
  }
};

/**
 * @desc    Delete activity
 * @route   DELETE /api/activities/:id
 * @access  Private (creator only)
 */
exports.deleteActivity = async (req, res) => {
  try {
    // Find activity
    const activity = await Activity.findById(req.params.id);
    
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }
    
    // Check if user is creator
    if (activity.creator.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this activity'
      });
    }
    
    await activity.remove();
    
    res.json({
      success: true,
      message: 'Activity removed'
    });
  } catch (error) {
    console.error('Delete activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting activity'
    });
  }
};

/**
 * @desc    Join activity
 * @route   POST /api/activities/:id/join
 * @access  Private
 */
exports.joinActivity = async (req, res) => {
  try {
    // Find activity
    const activity = await Activity.findById(req.params.id);
    
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }
    
    // Check if activity is active
    if (!activity.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This activity is no longer active'
      });
    }
    
    // Check if activity is full
    if (activity.isFull) {
      return res.status(400).json({
        success: false,
        message: 'This activity is already full'
      });
    }
    
    // Add user to participants
    const added = activity.addParticipant(req.user.id);
    if (!added) {
      return res.status(400).json({
        success: false,
        message: 'You are already a participant in this activity'
      });
    }
    
    await activity.save();
    
    // Get updated activity with populated fields
    const updatedActivity = await Activity.findById(req.params.id)
      .populate('creator', 'name college avatar')
      .populate('participants', 'name college avatar isOnline');
    
    res.json({
      success: true,
      message: 'Successfully joined activity',
      data: updatedActivity
    });
  } catch (error) {
    console.error('Join activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while joining activity'
    });
  }
};

/**
 * @desc    Leave activity
 * @route   POST /api/activities/:id/leave
 * @access  Private
 */
exports.leaveActivity = async (req, res) => {
  try {
    // Find activity
    const activity = await Activity.findById(req.params.id);
    
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }
    
    // Check if user is creator (creator cannot leave)
    if (activity.creator.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Activity creator cannot leave. You can delete or deactivate the activity instead.'
      });
    }
    
    // Remove user from participants
    const removed = activity.removeParticipant(req.user.id);
    if (!removed) {
      return res.status(400).json({
        success: false,
        message: 'You are not a participant in this activity'
      });
    }
    
    await activity.save();
    
    // Get updated activity with populated fields
    const updatedActivity = await Activity.findById(req.params.id)
      .populate('creator', 'name college avatar')
      .populate('participants', 'name college avatar isOnline');
    
    res.json({
      success: true,
      message: 'Successfully left activity',
      data: updatedActivity
    });
  } catch (error) {
    console.error('Leave activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while leaving activity'
    });
  }
};

/**
 * @desc    Get user's activities (activities the user has joined)
 * @route   GET /api/activities/user
 * @access  Private
 */
exports.getUserActivities = async (req, res) => {
  try {
    // Get user ID (either the logged in user or the requested user)
    const userId = req.query.userId || req.user.id;
    
    // Find activities where user is a participant
    const activities = await Activity.find({
      participants: userId,
      isActive: true
    })
      .sort({ createdAt: -1 })
      .populate('creator', 'name college avatar')
      .populate('participants', 'name college avatar isOnline');
    
    res.json({
      success: true,
      count: activities.length,
      data: activities
    });
  } catch (error) {
    console.error('Get user activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user activities'
    });
  }
};

/**
 * @desc    Get active users for an activity
 * @route   GET /api/activities/:id/users
 * @access  Private
 */
exports.getActiveUsers = async (req, res) => {
  try {
    // Find activity
    const activity = await Activity.findById(req.params.id);
    
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }
    
    // Get active users (online users who are participating)
    const users = await User.find({
      _id: { $in: activity.participants },
      isOnline: true
    }).select('_id name college avatar bio interests isOnline');
    
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Get active users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching active users'
    });
  }
};