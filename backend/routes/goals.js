const express = require('express');
const router = express.Router();
const Goal = require('../models/Goal');
const SalesRecord = require('../models/SalesRecord');
const Employee = require('../models/Employee');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/goals?year=2026&month=4
router.get('/', authenticate, async (req, res) => {
  try {
    const now = new Date();
    const { year = now.getFullYear(), month = now.getMonth() + 1, team } = req.query;
    let filter = { year: Number(year), month: Number(month), type: 'monthly' };
    if (team && team !== 'all') filter.team = team;

    const goals = await Goal.find(filter).populate('employeeId', 'name role team avatar target');

    // Get actual revenue for each employee
    const start = new Date(Number(year), Number(month) - 1, 1);
    const end = new Date(Number(year), Number(month), 0, 23, 59, 59);

    const actuals = await SalesRecord.aggregate([
      { $match: { date: { $gte: start, $lte: end }, status: 'closed' } },
      { $group: { _id: '$employeeId', actual: { $sum: '$amount' }, deals: { $sum: 1 } } },
    ]);

    const actualsMap = {};
    actuals.forEach((a) => (actualsMap[a._id.toString()] = a));

    const result = goals.map((g) => {
      const a = actualsMap[g.employeeId?._id?.toString()] || { actual: 0, deals: 0 };
      return {
        ...g.toObject(),
        actual: a.actual,
        deals: a.deals,
        progress: g.targetAmount > 0 ? Math.round((a.actual / g.targetAmount) * 100) : 0,
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/goals/history/:employeeId
router.get('/history/:employeeId', authenticate, async (req, res) => {
  try {
    const goals = await Goal.find({ employeeId: req.params.employeeId, type: 'monthly' })
      .sort({ year: -1, month: -1 })
      .limit(12);

    const results = [];
    for (const g of goals) {
      const start = new Date(g.year, g.month - 1, 1);
      const end = new Date(g.year, g.month, 0, 23, 59, 59);
      const agg = await SalesRecord.aggregate([
        { $match: { employeeId: g.employeeId, date: { $gte: start, $lte: end }, status: 'closed' } },
        { $group: { _id: null, actual: { $sum: '$amount' } } },
      ]);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      results.push({
        label: `${months[g.month - 1]} ${g.year}`,
        target: g.targetAmount,
        actual: agg[0]?.actual || 0,
      });
    }

    res.json(results.reverse());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/goals
router.post('/', authenticate, authorize('Admin', 'Manager'), async (req, res) => {
  try {
    const { employeeId, targetAmount, month, year, type = 'monthly', team } = req.body;
    const existing = await Goal.findOne({ employeeId, month, year, type });
    if (existing) {
      existing.targetAmount = targetAmount;
      await existing.save();
      return res.json(existing);
    }
    const goal = new Goal({ employeeId, targetAmount, month, year, type, team });
    await goal.save();
    res.status(201).json(goal);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/goals/bulk — set targets for all employees
router.post('/bulk', authenticate, authorize('Admin', 'Manager'), async (req, res) => {
  try {
    const { targets, month, year } = req.body;
    const results = [];
    for (const t of targets) {
      const existing = await Goal.findOne({ employeeId: t.employeeId, month, year, type: 'monthly' });
      if (existing) {
        existing.targetAmount = t.targetAmount;
        await existing.save();
        results.push(existing);
      } else {
        const goal = new Goal({ employeeId: t.employeeId, targetAmount: t.targetAmount, month, year, type: 'monthly' });
        await goal.save();
        results.push(goal);
      }
    }
    res.json(results);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
