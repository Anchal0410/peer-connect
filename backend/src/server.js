// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');

// // Load environment variables
// dotenv.config();

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Simple User Schema
// const UserSchema = new mongoose.Schema({
//   name: String,
//   email: String,
//   password: String,
//   college: String
// });

// // Hash password before saving
// UserSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) return next();
  
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

// const User = mongoose.model('User', UserSchema);

// // Connect to MongoDB without any options
// mongoose.connect('mongodb+srv://Anchal19_:jainanchal165@cluster0.qfgmiqh.mongodb.net/')
//   .then(() => console.log('MongoDB Connected'))
//   .catch(err => console.error('MongoDB connection error:', err));

// // Auth Routes
// // Updated registration endpoint with better error handling
// app.post('/api/auth/register', async (req, res) => {
//     try {
//       console.log('Register request received:', req.body);
      
//       // Validate input
//       const { name, email, password, college } = req.body;
//       if (!name || !email || !password || !college) {
//         return res.status(400).json({ 
//           message: 'Please provide all required fields' 
//         });
//       }
  
//       // Create user without MongoDB
//       // Using the file-based approach since MongoDB is not connecting
//       const id = Date.now().toString();
//       const salt = await bcrypt.genSalt(10);
//       const hashedPassword = await bcrypt.hash(password, salt);
      
//       // Create user object
//       const user = {
//         id,
//         name,
//         email,
//         college,
//         password: hashedPassword
//       };
      
//       // In a real app, you'd save this to the database
//       // For now, just log it
//       console.log('User created:', { id, name, email, college });
      
//       // Generate token
//       const token = jwt.sign(
//         { id },
//         process.env.JWT_SECRET || 'your_jwt_secret',
//         { expiresIn: '1h' }
//       );
      
//       // Return success response
//       return res.status(201).json({
//         success: true,
//         token,
//         user: {
//           id,
//           name,
//           email,
//           college
//         }
//       });
      
//     } catch (error) {
//       console.error('Registration error:', error);
//       return res.status(500).json({
//         success: false,
//         message: 'Server error during registration',
//         error: error.message
//       });
//     }
//   });


//   app.post('/api/auth/login', async (req, res) => {
//     try {
//       console.log('Login request:', req.body);
//       const { email, password } = req.body;
  
//       // For testing purposes, always succeed with a test user
//       const user = {
//         id: '123456',
//         name: 'Test User',
//         email: email,
//         college: 'Test College'
//       };
  
//       // Create token
//       const token = jwt.sign(
//         { id: user.id },
//         process.env.JWT_SECRET || 'jwtSecret',
//         { expiresIn: '1h' }
//       );
  
//       console.log('Generated token:', token);
      
//       res.json({
//         token,
//         user
//       });
//     } catch (err) {
//       console.error('Login error:', err);
//       res.status(500).json({ message: 'Server error' });
//     }
//   });
// // @route   GET /api/auth/me
// // @desc    Get current user data
// // Update your /api/auth/me endpoint
// app.get('/api/auth/me', (req, res) => {
//     try {
//       // Log the authorization header for debugging
//       console.log('Auth header:', req.headers.authorization);
      
//       // Check for token in header
//       const token = req.headers.authorization?.split(' ')[1];
      
//       if (!token) {
//         console.log('No token provided');
//         return res.status(401).json({ message: 'No token, authorization denied' });
//       }
      
//       try {
//         // Verify token
//         const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jwtSecret');
//         console.log('Decoded token:', decoded);
        
//         // Using the in-memory users array
//         const user = users.find(user => user.id === decoded.id);
        
//         if (!user) {
//           console.log('User not found for ID:', decoded.id);
//           return res.status(404).json({ message: 'User not found' });
//         }
        
//         // Return user data without password
//         const { password, ...userData } = user;
//         res.json(userData);
//       } catch (err) {
//         console.error('Token verification error:', err);
//         res.status(401).json({ message: 'Token is not valid' });
//       }
//     } catch (err) {
//       console.error('Auth error:', err);
//       res.status(500).json({ message: 'Server error' });
//     }
//   });

// // Basic test route
// app.get('/api/test', (req, res) => {
//   res.json({ message: 'API is working' });
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// In-memory user storage (replace with MongoDB later)
const users = [];

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, college } = req.body;
    
    // Check if user exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const user = {
      id: Date.now().toString(),
      name,
      email,
      password: hashedPassword,
      college
    };
    
    // Add to users array
    users.push(user);
    console.log('User registered:', user.email);
    
    // Create token
    const token = jwt.sign(
      { id: user.id },
      'your_jwt_secret',
      { expiresIn: '1d' }
    );
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    
    res.status(201).json({
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('Login attempt:', req.body);
    const { email, password } = req.body;
    
    // Find user
    const user = users.find(user => user.email === email);
    
    if (!user) {
      console.log('User not found:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      console.log('Invalid password for:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    console.log('User logged in:', user.email);
    
    // Create token
    const token = jwt.sign(
      { id: user.id },
      'your_jwt_secret',
      { expiresIn: '1d' }
    );
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// For testing
app.get('/api/auth/me', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  console.log('Auth request received, token:', token);
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  res.json({ message: 'Auth endpoint working' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));