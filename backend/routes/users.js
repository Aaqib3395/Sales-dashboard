const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/users — Admin only
router.get('/', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ name: 1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/users/:id/role — Admin only
router.put('/:id/role', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const { role } = req.body;
    if (!['Admin', 'Manager', 'Sales Rep'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/users/:id/team
router.put('/:id/team', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const { team } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { team }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/users/:id/status — activate/deactivate
router.put('/:id/status', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
