const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const passport = require('../config/passport');
const authMiddleware = require('../middleware/auth');

// =============================================
// REGISTER
// =============================================
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName, branchCode } = req.body;

    // Validate input
    if (!email || !password || !fullName) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user exists
    const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Get branch ID if branch code provided
    let branchId = null;
    if (branchCode) {
      const [branches] = await db.query('SELECT id FROM branches WHERE branch_code = ?', [branchCode]);
      if (branches.length > 0) {
        branchId = branches[0].id;
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [result] = await db.query(
      'INSERT INTO users (email, password, full_name, branch_id, role) VALUES (?, ?, ?, ?, ?)',
      [email, hashedPassword, fullName, branchId, 'user']
    );

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: result.insertId, 
        email, 
        role: 'user',
        branchId 
      },
      process.env.JWT_SECRET || 'your-secret-key-here',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: result.insertId,
        email,
        fullName,
        role: 'user',
        branchId
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// =============================================
// LOGIN
// =============================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    // Check password
    if (!user.password) {
      return res.status(401).json({ message: 'Please use Google Sign-In' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        branchId: user.branch_id 
      },
      process.env.JWT_SECRET || 'your-secret-key-here',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        branchId: user.branch_id,
        profilePicture: user.profile_picture
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// =============================================
// GOOGLE OAUTH
// =============================================
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: req.user.id, 
        email: req.user.email, 
        role: req.user.role,
        branchId: req.user.branch_id 
      },
      process.env.JWT_SECRET || 'your-secret-key-here',
      { expiresIn: '7d' }
    );

    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${token}`);
  }
);

// =============================================
// GET CURRENT USER
// =============================================
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, email, full_name, role, branch_id, profile_picture FROM users WHERE id = ?', [req.user.id]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: users[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// =============================================
// VERIFY BRANCH ACCESS
// =============================================
router.post('/verify-branch', authMiddleware, async (req, res) => {
  try {
    const { branchCode } = req.body;

    if (!branchCode) {
      return res.status(400).json({ message: 'Branch code is required' });
    }

    // Verify branch code exists
    const [branches] = await db.query('SELECT * FROM branches WHERE branch_code = ?', [branchCode]);
    
    if (branches.length === 0) {
      return res.status(404).json({ message: 'Invalid branch code' });
    }

    const branch = branches[0];

    // Check if user has access (admin can access all, users can access their branch)
    if (req.user.role !== 'admin' && req.user.branchId !== branch.id) {
      return res.status(403).json({ message: 'Access denied to this branch' });
    }

    res.json({
      message: 'Branch access verified',
      branch: {
        id: branch.id,
        name: branch.name,
        code: branch.branch_code
      }
    });
  } catch (error) {
    console.error('Branch verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// =============================================
// LOG UPLOAD
// =============================================
router.post('/log-upload', authMiddleware, async (req, res) => {
  try {
    const { branchId, fileName, fileSize } = req.body;

    await db.query(
      'INSERT INTO upload_logs (user_id, branch_id, file_name, file_size, status) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, branchId, fileName, fileSize, 'approved']
    );

    res.json({ message: 'Upload logged successfully' });
  } catch (error) {
    console.error('Upload logging error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;