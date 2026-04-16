const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const { authenticate } = require('../middleware/auth');

// GET /api/activities?team=all&employeeId=all&page=1&limit=30
router.get('/', authenticate, async (req, res) => {
  try {
    const { team, employeeId, page = 1, limit = 30 } = req.query;
    let filter = {};

    if (employeeId && employeeId !== 'all') {
      filter.employeeId = employeeId;
    }

    if (team && team !== 'all') {
      filter['metadata.team'] = team;
    }

    const activities = await Activity.find(filter)
      .populate('employeeId', 'name avatar team')
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Activity.countDocuments(filter);
    res.json({ activities, total, page: Number(page) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
