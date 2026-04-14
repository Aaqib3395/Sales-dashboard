const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const SalesRecord = require('../models/SalesRecord');

// GET /api/employees?team=all&page=1&limit=20
router.get('/', async (req, res) => {
  try {
    const { team, search, page = 1, limit = 50 } = req.query;
    let filter = { isActive: true };
    if (team && team !== 'all') filter.team = team;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const employees = await Employee.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ name: 1 });

    const total = await Employee.countDocuments(filter);
    res.json({ employees, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/employees/performance?period=monthly&team=all
router.get('/performance', async (req, res) => {
  try {
    const { period = 'monthly', team, employeeId } = req.query;
    const now = new Date();
    let start;
    if (period === 'weekly') {
      start = new Date(now);
      start.setDate(now.getDate() - 7);
    } else {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    let empFilter = { isActive: true };
    if (team && team !== 'all') empFilter.team = team;
    if (employeeId && employeeId !== 'all') empFilter._id = employeeId;

    const employees = await Employee.find(empFilter);
    const empIds = employees.map((e) => e._id);

    // Aggregate sales per employee
    const salesAgg = await SalesRecord.aggregate([
      {
        $match: {
          date: { $gte: start, $lte: now },
          employeeId: { $in: empIds },
        },
      },
      {
        $group: {
          _id: { employeeId: '$employeeId', status: '$status' },
          count: { $sum: 1 },
          amount: { $sum: '$amount' },
        },
      },
    ]);

    // Total leads assigned per employee
    const leadsAgg = await SalesRecord.aggregate([
      {
        $match: {
          date: { $gte: start, $lte: now },
          employeeId: { $in: empIds },
        },
      },
      {
        $group: {
          _id: '$employeeId',
          totalLeads: { $sum: 1 },
          totalRevenue: {
            $sum: {
              $cond: [{ $eq: ['$status', 'closed'] }, '$amount', 0],
            },
          },
          dealsClosed: {
            $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] },
          },
        },
      },
    ]);

    const leadsMap = {};
    leadsAgg.forEach((l) => {
      leadsMap[l._id.toString()] = l;
    });

    const performance = employees.map((emp) => {
      const data = leadsMap[emp._id.toString()] || {
        totalLeads: 0,
        totalRevenue: 0,
        dealsClosed: 0,
      };
      const conversionRate =
        data.totalLeads > 0 ? ((data.dealsClosed / data.totalLeads) * 100).toFixed(1) : 0;
      const targetAchievement =
        emp.target > 0 ? ((data.totalRevenue / emp.target) * 100).toFixed(1) : 0;

      let indicator = 'average';
      if (targetAchievement >= 100) indicator = 'excellent';
      else if (targetAchievement >= 75) indicator = 'good';
      else if (targetAchievement < 50) indicator = 'poor';

      return {
        _id: emp._id,
        name: emp.name,
        email: emp.email,
        role: emp.role,
        team: emp.team,
        avatar: emp.avatar,
        target: emp.target,
        revenue: data.totalRevenue,
        dealsClosed: data.dealsClosed,
        leadsAssigned: data.totalLeads,
        conversionRate: Number(conversionRate),
        targetAchievement: Number(targetAchievement),
        indicator,
      };
    });

    performance.sort((a, b) => b.revenue - a.revenue);
    res.json(performance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/employees/:id
router.get('/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/employees/:id/stats?period=monthly
router.get('/:id/stats', async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;
    const now = new Date();
    let start;
    if (period === 'weekly') {
      start = new Date(now);
      start.setDate(now.getDate() - 7);
    } else {
      start = new Date(now.getFullYear() - 1, now.getMonth(), 1); // last 12 months
    }

    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ error: 'Employee not found' });

    // Monthly trend
    const trend = await SalesRecord.aggregate([
      {
        $match: {
          employeeId: employee._id,
          date: { $gte: start },
          status: 'closed',
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          revenue: { $sum: '$amount' },
          deals: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedTrend = trend.map((t) => ({
      label: `${months[t._id.month - 1]} ${String(t._id.year).slice(2)}`,
      revenue: t.revenue,
      deals: t.deals,
    }));

    // Pipeline breakdown
    const pipeline = await SalesRecord.aggregate([
      {
        $match: {
          employeeId: employee._id,
          date: { $gte: new Date(now.getFullYear(), now.getMonth(), 1) },
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          value: { $sum: '$amount' },
        },
      },
    ]);

    // Recent activity
    const recentActivity = await SalesRecord.find({ employeeId: employee._id })
      .sort({ updatedAt: -1 })
      .limit(10)
      .select('clientName product amount status date notes');

    res.json({ employee, trend: formattedTrend, pipeline, recentActivity });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/employees
router.post('/', async (req, res) => {
  try {
    const employee = new Employee(req.body);
    await employee.save();
    res.status(201).json(employee);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/employees/:id
router.put('/:id', async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    res.json(employee);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/employees/:id (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    res.json({ message: 'Employee deactivated', employee });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
