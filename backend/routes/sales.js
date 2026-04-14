const express = require('express');
const router = express.Router();
const SalesRecord = require('../models/SalesRecord');
const Employee = require('../models/Employee');

// GET /api/sales?status=all&employeeId=all&page=1
router.get('/', async (req, res) => {
  try {
    const { status, employeeId, team, page = 1, limit = 20 } = req.query;
    let filter = {};

    if (status && status !== 'all') filter.status = status;
    if (employeeId && employeeId !== 'all') filter.employeeId = employeeId;

    if (team && team !== 'all') {
      const employees = await Employee.find({ team }).select('_id');
      filter.employeeId = { $in: employees.map((e) => e._id) };
    }

    const records = await SalesRecord.find(filter)
      .populate('employeeId', 'name email role team')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await SalesRecord.countDocuments(filter);
    res.json({ records, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/sales/kanban - pipeline grouped by status
router.get('/kanban', async (req, res) => {
  try {
    const { team, employeeId } = req.query;
    let filter = {};

    if (employeeId && employeeId !== 'all') {
      filter.employeeId = employeeId;
    } else if (team && team !== 'all') {
      const employees = await Employee.find({ team }).select('_id');
      filter.employeeId = { $in: employees.map((e) => e._id) };
    }

    const records = await SalesRecord.find(filter)
      .populate('employeeId', 'name avatar')
      .sort({ updatedAt: -1 });

    const kanban = {
      lead: [],
      'follow-up': [],
      negotiation: [],
      closed: [],
    };

    records.forEach((r) => {
      if (kanban[r.status]) {
        kanban[r.status].push({
          _id: r._id,
          clientName: r.clientName,
          product: r.product,
          amount: r.amount,
          probability: r.probability,
          notes: r.notes,
          date: r.date,
          employee: r.employeeId,
        });
      }
    });

    res.json(kanban);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/sales
router.post('/', async (req, res) => {
  try {
    const record = new SalesRecord(req.body);
    await record.save();
    const populated = await record.populate('employeeId', 'name email role');
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/sales/:id
router.put('/:id', async (req, res) => {
  try {
    const record = await SalesRecord.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('employeeId', 'name email role');
    if (!record) return res.status(404).json({ error: 'Record not found' });
    res.json(record);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/sales/:id/status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const record = await SalesRecord.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('employeeId', 'name');
    if (!record) return res.status(404).json({ error: 'Record not found' });
    res.json(record);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/sales/:id
router.delete('/:id', async (req, res) => {
  try {
    const record = await SalesRecord.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ error: 'Record not found' });
    res.json({ message: 'Record deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/sales/export?period=monthly - CSV export data
router.get('/export', async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;
    const now = new Date();
    let start;
    if (period === 'weekly') {
      start = new Date(now);
      start.setDate(now.getDate() - 7);
    } else {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const records = await SalesRecord.find({ date: { $gte: start } })
      .populate('employeeId', 'name role team')
      .sort({ date: -1 });

    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
