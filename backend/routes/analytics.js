const express = require('express');
const router = express.Router();
const SalesRecord = require('../models/SalesRecord');
const { authenticate } = require('../middleware/auth');

// GET /api/analytics/forecast — revenue forecast next 3 months
router.get('/forecast', authenticate, async (req, res) => {
  try {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

    const trend = await SalesRecord.aggregate([
      { $match: { date: { $gte: sixMonthsAgo }, status: 'closed' } },
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' } },
          revenue: { $sum: '$amount' },
          deals: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const historical = trend.map((t) => ({
      label: `${months[t._id.month - 1]} ${String(t._id.year).slice(2)}`,
      revenue: t.revenue,
      deals: t.deals,
      type: 'actual',
    }));

    // Simple linear regression forecast
    const revenues = trend.map((t) => t.revenue);
    const n = revenues.length;
    let forecast = [];
    if (n >= 2) {
      const avgGrowth = revenues.slice(1).reduce((sum, v, i) => sum + (v - revenues[i]), 0) / (n - 1);
      const lastRevenue = revenues[n - 1] || 0;
      for (let i = 1; i <= 3; i++) {
        const futureMonth = new Date(now.getFullYear(), now.getMonth() + i, 1);
        forecast.push({
          label: `${months[futureMonth.getMonth()]} ${String(futureMonth.getFullYear()).slice(2)}`,
          revenue: Math.max(0, Math.round(lastRevenue + avgGrowth * i)),
          deals: 0,
          type: 'forecast',
        });
      }
    }

    res.json({ historical, forecast });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/growth — month-over-month growth
router.get('/growth', authenticate, async (req, res) => {
  try {
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);

    const trend = await SalesRecord.aggregate([
      { $match: { date: { $gte: twelveMonthsAgo }, status: 'closed' } },
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' } },
          revenue: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const growth = trend.map((t, i) => {
      const prev = i > 0 ? trend[i - 1].revenue : null;
      const pct = prev ? (((t.revenue - prev) / prev) * 100).toFixed(1) : null;
      return {
        label: `${months[t._id.month - 1]} ${String(t._id.year).slice(2)}`,
        revenue: t.revenue,
        growth: pct !== null ? Number(pct) : null,
      };
    });

    res.json(growth);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/win-loss
router.get('/win-loss', authenticate, async (req, res) => {
  try {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const data = await SalesRecord.aggregate([
      { $match: { date: { $gte: start } } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            status: '$status',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const grouped = {};
    data.forEach((d) => {
      const key = `${months[d._id.month - 1]} ${String(d._id.year).slice(2)}`;
      if (!grouped[key]) grouped[key] = { label: key, closed: 0, lost: 0, open: 0 };
      if (d._id.status === 'closed') grouped[key].closed += d.count;
      else grouped[key].open += d.count;
    });

    res.json(Object.values(grouped));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/deal-size
router.get('/deal-size', authenticate, async (req, res) => {
  try {
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);

    const data = await SalesRecord.aggregate([
      { $match: { date: { $gte: twelveMonthsAgo }, status: 'closed' } },
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' } },
          avgDealSize: { $avg: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    res.json(
      data.map((d) => ({
        label: `${months[d._id.month - 1]} ${String(d._id.year).slice(2)}`,
        avgDealSize: Math.round(d.avgDealSize),
        count: d.count,
      }))
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/heatmap — sales by day of week
router.get('/heatmap', authenticate, async (req, res) => {
  try {
    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);

    const data = await SalesRecord.aggregate([
      { $match: { date: { $gte: threeMonthsAgo } } },
      {
        $group: {
          _id: { dayOfWeek: { $dayOfWeek: '$date' }, status: '$status' },
          count: { $sum: 1 },
          value: { $sum: '$amount' },
        },
      },
    ]);

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const heatmap = days.map((day, i) => {
      const dayData = data.filter((d) => d._id.dayOfWeek === i + 1);
      return {
        day,
        total: dayData.reduce((s, d) => s + d.count, 0),
        closed: dayData.filter((d) => d._id.status === 'closed').reduce((s, d) => s + d.count, 0),
        value: dayData.reduce((s, d) => s + d.value, 0),
      };
    });

    res.json(heatmap);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/cycle-length — average days to close
router.get('/cycle-length', authenticate, async (req, res) => {
  try {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

    const closedDeals = await SalesRecord.find({
      status: 'closed',
      date: { $gte: sixMonthsAgo },
    }).select('date createdAt');

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const grouped = {};

    closedDeals.forEach((deal) => {
      const closeDate = new Date(deal.date);
      const createDate = new Date(deal.createdAt);
      const days = Math.max(1, Math.round((closeDate - createDate) / (1000 * 60 * 60 * 24)));
      const key = `${months[closeDate.getMonth()]} ${String(closeDate.getFullYear()).slice(2)}`;

      if (!grouped[key]) grouped[key] = { label: key, totalDays: 0, count: 0 };
      grouped[key].totalDays += days;
      grouped[key].count += 1;
    });

    const result = Object.values(grouped).map((g) => ({
      label: g.label,
      avgDays: Math.round(g.totalDays / g.count),
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
