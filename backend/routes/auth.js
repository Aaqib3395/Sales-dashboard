const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticate, generateTokens, JWT_SECRET, verifyJWT } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, team } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'Sales Rep',
      team: team || '',
    });

    await user.save();
    const tokens = generateTokens(user._id);

    res.status(201).json({
      user: user.toJSON(),
      ...tokens,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const tokens = generateTokens(user._id);

    res.json({
      user: user.toJSON(),
      ...tokens,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required.' });
    }

    const decoded = verifyJWT(refreshToken, JWT_SECRET);
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ error: 'Invalid refresh token.' });
    }

    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found or deactivated.' });
    }

    const tokens = generateTokens(user._id);
    res.json({ user: user.toJSON(), ...tokens });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired refresh token.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
  res.json(req.user);
});

// PUT /api/auth/preferences
router.put('/preferences', authenticate, async (req, res) => {
  try {
    const { darkMode, emailDigestEnabled } = req.body;
    const updates = {};
    if (darkMode !== undefined) updates.darkMode = darkMode;
    if (emailDigestEnabled !== undefined) updates.emailDigestEnabled = emailDigestEnabled;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
