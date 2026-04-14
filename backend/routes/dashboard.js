const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const SalesRecord = require('../models/SalesRecord');

// Helper: get date range
function getDateRange(period) {
  const now = new Date();
  let start;
  if (period === 'weekly') {
    start = new Date(now);
    start.setDate(now.getDate() - 7);
  } else {
    // monthly
    start = new Date(now.getFullYear(), now.getMonth(), 1);
  }
  return { start, end: now };
}

// GET /api/dashboard/kpis?period=monthly&team=all&employeeId=all
router.get('/kpis', async (req, res) => {
  try {
    const { period = 'monthly', team, employeeId } = req.query;
    const { start, end } = getDateRange(period);

    // Build match filter
    let empFilter = { isActive: true };
    if (team && team !== 'all') empFilter.team = team;

    let employees = await Employee.find(empFilter).select('_id');
    let empIds = employees.map((e) => e._id);

    let recordFilter = {
      date: { $gte: start, $lte: end },
      employeeId: { $in: empIds },
    };
    if (employeeId && employeeId !== 'all') {
      recordFilter.employeeId = employeeId;
    }

    // Total Sales (closed only)
    const closedFilter = { ...recordFilter, status: 'closed' };

    const totalSalesAgg = await SalesRecord.aggregate([
      { $match: closedFilter },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);

    const totalSales = totalSalesAgg[0]?.total || 0;
    const dealsClosedCount = totalSalesAgg[0]?.count || 0;

    // Active Leads
    const activeLeads = await SalesRecord.countDocuments({
      ...recordFilter,
      status: { $in: ['lead', 'follow-up', 'negotiation'] },
    });

    // Total leads for conversion rate
    const totalLeadsAgg = await SalesRecord.countDocuments(recordFilter);
    const conversionRate =
      totalLeadsAgg > 0 ? ((dealsClosedCount / totalLeadsAgg) * 100).toFixed(1) : 0;

    // Previous period for comparison
    let prevStart, prevEnd;
    if (period === 'weekly') {
      prevStart = new Date(start);
      prevStart.setDate(prevStart.getDate() - 7);
      prevEnd = new Date(start);
    } else {
      prevStart = new Date(start.getFullYear(), start.getMonth() - 1, 1);
      prevEnd = new Date(start.getFullYear(), start.getMonth(), 0);
    }

    const prevClosedFilter = {
      date: { $gte: prevStart, $lte: prevEnd },
      employeeId: { $in: empIds },
      status: 'closed',
    };
    const prevSalesAgg = await SalesRecord.aggregate([
      { $match: prevClosedFilter },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const prevSales = prevSalesAgg[0]?.total || 0;
    const salesGrowth =
      prevSales > 0 ? (((totalSales - prevSales) / prevSales) * 100).toFixed(1) : 0;

    res.json({
      totalSales,
      dealsClosedCount,
      activeLeads,
      conversionRate: Number(conversionRate),
      salesGrowth: Number(salesGrowth),
      period,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/dashboard/trend?period=monthly
router.get('/trend', async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;
    const now = new Date();
    let groupBy, start;

    if (period === 'weekly') {
      start = new Date(now);
      start.setDate(now.getDate() - 28); // last 4 weeks
      groupBy = {
        year: { $year: '$date' },
        week: { $week: '$date' },
      };
    } else {
      start = new Date(now.getFullYear() - 1, now.getMonth(), 1); // last 12 months
      groupBy = {
        year: { $year: '$date' },
        month: { $month: '$date' },
      };
    }

    const trend = await SalesRecord.aggregate([
      { $match: { date: { $gte: start }, status: 'closed' } },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: '$amount' },
          deals: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.week': 1 } },
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formatted = trend.map((t) => ({
      label:
        period === 'weekly'
          ? `W${t._id.week}`
          : `${months[t._id.month - 1]} ${String(t._id.year).slice(2)}`,
      revenue: t.revenue,
      deals: t.deals,
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/dashboard/pipeline
router.get('/pipeline', async (req, res) => {
  try {
    const pipeline = await SalesRecord.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          value: { $sum: '$amount' },
        },
      },
    ]);

    const order = ['lead', 'follow-up', 'negotiation', 'closed'];
    const labels = {
      lead: 'Hot Leads',
      'follow-up': 'Follow-ups',
      negotiation: 'Negotiation',
      closed: 'Contracts Signed',
    };
    const colors = {
      lead: '#f97316',
      'follow-up': '#3b82f6',
      negotiation: '#8b5cf6',
      closed: '#22c55e',
    };

    const formatted = order.map((status) => {
      const found = pipeline.find((p) => p._id === status);
      return {
        status,
        label: labels[status],
        count: found?.count || 0,
        value: found?.value || 0,
        color: colors[status],
      };
    });

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/dashboard/leaderboard?period=monthly
router.get('/leaderboard', async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;
    const { start, end } = getDateRange(period);

    const leaderboard = await SalesRecord.aggregate([
      { $match: { date: { $gte: start, $lte: end }, status: 'closed' } },
      {
        $group: {
          _id: '$employeeId',
          revenue: { $sum: '$amount' },
          deals: { $sum: 1 },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'employees',
          localField: '_id',
          foreignField: '_id',
          as: 'employee',
        },
      },
      { $unwind: '$employee' },
      {
        $project: {
          name: '$employee.name',
          role: '$employee.role',
          team: '$employee.team',
          avatar: '$employee.avatar',
          revenue: 1,
          deals: 1,
        },
      },
    ]);

    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
