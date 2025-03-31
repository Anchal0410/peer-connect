const User = require('../models/User');
const Activity = require('../models/Activity');
const { validationResult } = require('express-validator');

/**
 * @desc    Get user profile
 * @route   GET /api/users/:id
 * @access  Private
 */
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-__v');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user profile'
    });
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
exports.updateProfile = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { name, college, bio, interests, avatar } = req.body;
    
    // Build update object
    const updateData = {};
    if (name) updateData.name = name;
    if (college) updateData.college = college;
    if (bio !== undefined) updateData.bio = bio;
    if (interests) updateData.interests = interests;
    if (avatar !== undefined) updateData.avatar = avatar;
    
    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
};

/**
 * @desc    Get online users
 * @route   GET /api/users/online
 * @access  Private
 */
exports.getOnlineUsers = async (req, res) => {
  try {
    // Get limit from query params or default to 20
    const limit = parseInt(req.query.limit) || 20;
    
    // Find online users (exclude current user)
    const users = await User.find({
      isOnline: true,
      _id: { $ne: req.user.id }
    })
      .select('name college avatar bio interests isOnline')
      .limit(limit);
    
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Get online users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching online users'
    });
  }
};

/**
 * @desc    Search users
 * @route   GET /api/users/search
 * @access  Private
 */
exports.searchUsers = async (req, res) => {
  try {
    const { query, college, interests, limit = 20 } = req.query;
    
    // Build search filter
    const filter = { _id: { $ne: req.user.id } };
    
    // Add query filter (search in name or email)
    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ];
    }
    
    // Add college filter
    if (college) {
      filter.college = { $regex: college, $options: 'i' };
    }
    
    // Add interests filter
    if (interests) {
      const interestArray = interests.split(',').map(i => i.trim());
      filter.interests = { $in: interestArray };
    }
    
    // Find users matching the search criteria
    const users = await User.find(filter)
      .select('name college avatar bio interests isOnline')
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching users'
    });
  }
};

/**
 * @desc    Get user suggestions based on activities
 * @route   GET /api/users/suggestions
 * @access  Private
 */
exports.getUserSuggestions = async (req, res) => {
  try {
    // Get limit from query params or default to 10
    const limit = parseInt(req.query.limit) || 10;
    
    // 1. Find user's activities
    const userActivities = await Activity.find({
      participants: req.user.id
    });
    
    // 2. Get unique categories from user's activities
    const categories = [...new Set(userActivities.map(activity => activity.category))];
    
    // 3. Find active users who are interested in similar activities
    // but not already connected with the current user
    let suggestedUsers = [];
    
    if (categories.length > 0) {
      // Find activities in the same categories
      const similarActivities = await Activity.find({
        category: { $in: categories },
        participants: { $ne: req.user.id }
      });
      
      // Get unique user IDs from those activities
      const userIds = [...new Set(
        similarActivities.flatMap(activity => 
          activity.participants.map(p => p.toString())
        )
      )];
      
      // Fetch those users
      if (userIds.length > 0) {
        suggestedUsers = await User.find({
          _id: { $in: userIds, $ne: req.user.id }
        })
          .select('name college avatar bio interests isOnline')
          .limit(limit);
      }
    }
    
    // 4. If we don't have enough suggestions, add some recently active users
    if (suggestedUsers.length < limit) {
      const additionalLimit = limit - suggestedUsers.length;
      const existingIds = suggestedUsers.map(user => user._id);
      
      const additionalUsers = await User.find({
        _id: { $ne: req.user.id, $nin: existingIds },
        isOnline: true
      })
        .sort({ lastActive: -1 })
        .select('name college avatar bio interests isOnline')
        .limit(additionalLimit);
      
      suggestedUsers = [...suggestedUsers, ...additionalUsers];
    }
    
    res.json({
      success: true,
      count: suggestedUsers.length,
      data: suggestedUsers
    });
  } catch (error) {
    console.error('Get user suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user suggestions'
    });
  }
};