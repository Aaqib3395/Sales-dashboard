const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const SalesRecord = require('../models/SalesRecord');
const { authenticate } = require('../middleware/auth');

// GET /api/clients
router.get('/', authenticate, async (req, res) => {
  try {
    const { search, page = 1, limit = 20, sort = 'name' } = req.query;
    let filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }

    const sortObj = sort === 'recent' ? { createdAt: -1 } : { name: 1 };
    const clients = await Client.find(filter)
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Client.countDocuments(filter);
    res.json({ clients, total, page: Number(page) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/clients/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ error: 'Client not found' });

    // Find associated deals by clientName match
    const deals = await SalesRecord.find({ clientName: client.name })
      .populate('employeeId', 'name role team')
      .sort({ date: -1 })
      .limit(50);

    res.json({ client, deals });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/clients
router.post('/', authenticate, async (req, res) => {
  try {
    const client = new Client({ ...req.body, createdBy: req.user._id });
    await client.save();
    res.status(201).json(client);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/clients/:id
router.put('/:id', authenticate, async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!client) return res.status(404).json({ error: 'Client not found' });
    res.json(client);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/clients/:id
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) return res.status(404).json({ error: 'Client not found' });
    res.json({ message: 'Client deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
