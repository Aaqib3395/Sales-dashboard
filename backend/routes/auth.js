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

// TEMPORARY: full reset seed endpoint
router.post('/seed-users', async (req, res) => {
  try {
    const Client = require('../models/Client');
    const Notification = require('../models/Notification');
    const Activity = require('../models/Activity');
    const Goal = require('../models/Goal');
    const Employee = require('../models/Employee');
    const SalesRecord = require('../models/SalesRecord');
    const results = [];

    // Always reset everything
    await User.deleteMany({});
    await Client.deleteMany({});
    await Goal.deleteMany({});
    await Notification.deleteMany({});
    await Activity.deleteMany({});
    await Employee.deleteMany({});
    await SalesRecord.deleteMany({});
    results.push('Cleared all collections');

    // Seed employees
    const employeeData = [
      { name: 'Alex Johnson', email: 'alex.j@flowtech.com', role: 'Sales Manager', team: 'Team Alpha', target: 80000, phone: '+1-555-0101' },
      { name: 'Sarah Mitchell', email: 'sarah.m@flowtech.com', role: 'Senior Sales Rep', team: 'Team Alpha', target: 60000, phone: '+1-555-0102' },
      { name: 'Marcus Chen', email: 'marcus.c@flowtech.com', role: 'Account Executive', team: 'Team Beta', target: 55000, phone: '+1-555-0103' },
      { name: 'Priya Sharma', email: 'priya.s@flowtech.com', role: 'Sales Rep', team: 'Team Beta', target: 40000, phone: '+1-555-0104' },
      { name: 'Jake Williams', email: 'jake.w@flowtech.com', role: 'Team Lead', team: 'Team Gamma', target: 70000, phone: '+1-555-0105' },
      { name: 'Elena Rodriguez', email: 'elena.r@flowtech.com', role: 'Senior Sales Rep', team: 'Team Gamma', target: 58000, phone: '+1-555-0106' },
      { name: 'David Kim', email: 'david.k@flowtech.com', role: 'Sales Rep', team: 'Team Delta', target: 42000, phone: '+1-555-0107' },
      { name: 'Amy Thompson', email: 'amy.t@flowtech.com', role: 'Account Executive', team: 'Team Delta', target: 52000, phone: '+1-555-0108' },
      { name: "Ryan O'Brien", email: 'ryan.o@flowtech.com', role: 'Sales Rep', team: 'Team Alpha', target: 38000, phone: '+1-555-0109' },
      { name: 'Nina Patel', email: 'nina.p@flowtech.com', role: 'Senior Sales Rep', team: 'Team Beta', target: 62000, phone: '+1-555-0110' },
      { name: 'Carlos Mendez', email: 'carlos.m@flowtech.com', role: 'Sales Rep', team: 'Team Gamma', target: 45000, phone: '+1-555-0111' },
      { name: 'Lily Zhang', email: 'lily.z@flowtech.com', role: 'Team Lead', team: 'Team Delta', target: 72000, phone: '+1-555-0112' },
    ];
    const employees = await Employee.insertMany(employeeData);
    results.push('Employees: seeded ' + employees.length);

    // Seed sales records
    const products = ['Enterprise CRM', 'Pro Analytics', 'Sales Suite', 'Marketing Hub', 'Data Pipeline', 'Cloud Integration', 'AI Assistant', 'Custom Reporting'];
    const clientNames = ['GlobalMart', 'TechVision Inc', 'Bright Solutions', 'Apex Corp', 'Blue Horizon', 'NextGen Ltd', 'Prime Goods', 'Summit Tech', 'Stellar Systems', 'Vanguard Co', 'Pinnacle Group', 'Echo Digital', 'Rapid Growth LLC', 'Titan Enterprises', 'Nova Analytics', 'Pulse Marketing'];
    const statuses = ['lead', 'follow-up', 'negotiation', 'closed'];
    const statusWeights = [0.2, 0.25, 0.2, 0.35];
    function pickWeighted(arr, weights) { const r = Math.random(); let c = 0; for (let i = 0; i < arr.length; i++) { c += weights[i]; if (r <= c) return arr[i]; } return arr[arr.length - 1]; }
    const records = [];
    for (let i = 0; i < 800; i++) {
      const emp = employees[Math.floor(Math.random() * employees.length)];
      const status = pickWeighted(statuses, statusWeights);
      const amount = Math.floor(Math.random() * 18000) + 2000;
      const prob = status === 'closed' ? 100 : status === 'negotiation' ? Math.floor(Math.random() * 30) + 60 : status === 'follow-up' ? Math.floor(Math.random() * 30) + 30 : Math.floor(Math.random() * 30) + 10;
      const d = new Date(); d.setDate(d.getDate() - Math.floor(Math.random() * 365));
      records.push({ employeeId: emp._id, date: d, amount, status, clientName: clientNames[Math.floor(Math.random() * clientNames.length)], product: products[Math.floor(Math.random() * products.length)], probability: prob, notes: status === 'closed' ? 'Deal signed and closed' : status === 'negotiation' ? 'In contract discussions' : status === 'follow-up' ? 'Sent proposal' : 'Initial contact' });
    }
    await SalesRecord.insertMany(records);
    results.push('Sales records: seeded ' + records.length);

    // Seed users
    const users = [
      { name: 'Admin User', email: 'admin@flowtech.com', password: 'admin123', role: 'Admin' },
      { name: 'Alex Johnson', email: 'alex.j@flowtech.com', password: 'manager123', role: 'Manager', team: 'Team Alpha', employeeId: employees[0]._id },
      { name: 'Sarah Mitchell', email: 'sarah.m@flowtech.com', password: 'sales123', role: 'Manager', team: 'Team Alpha', employeeId: employees[1]._id },
      { name: 'Marcus Chen', email: 'marcus.c@flowtech.com', password: 'sales123', role: 'Sales Rep', team: 'Team Beta', employeeId: employees[2]._id },
      { name: 'Priya Sharma', email: 'priya.s@flowtech.com', password: 'sales123', role: 'Sales Rep', team: 'Team Beta', employeeId: employees[3]._id },
      { name: 'Jake Williams', email: 'jake.w@flowtech.com', password: 'sales123', role: 'Manager', team: 'Team Gamma', employeeId: employees[4]._id },
      { name: 'Elena Rodriguez', email: 'elena.r@flowtech.com', password: 'sales123', role: 'Sales Rep', team: 'Team Gamma', employeeId: employees[5]._id },
      { name: 'David Kim', email: 'david.k@flowtech.com', password: 'sales123', role: 'Sales Rep', team: 'Team Delta', employeeId: employees[6]._id },
      { name: 'Amy Thompson', email: 'amy.t@flowtech.com', password: 'sales123', role: 'Sales Rep', team: 'Team Delta', employeeId: employees[7]._id },
      { name: 'Ryan OBrien', email: 'ryan.o@flowtech.com', password: 'sales123', role: 'Sales Rep', team: 'Team Alpha', employeeId: employees[8]._id },
      { name: 'Nina Patel', email: 'nina.p@flowtech.com', password: 'sales123', role: 'Sales Rep', team: 'Team Beta', employeeId: employees[9]._id },
      { name: 'Carlos Mendez', email: 'carlos.m@flowtech.com', password: 'sales123', role: 'Sales Rep', team: 'Team Gamma', employeeId: employees[10]._id },
      { name: 'Lily Zhang', email: 'lily.z@flowtech.com', password: 'sales123', role: 'Manager', team: 'Team Delta', employeeId: employees[11]._id },
    ];
    for (const u of users) { const user = new User(u); await user.save(); }
    results.push('Users: seeded ' + users.length);

    // Seed clients
    const clientDocs = clientNames.map(n => ({ name: n, company: n, email: 'contact@' + n.toLowerCase().replace(/\s+/g, '') + '.com', phone: '+1-555-' + String(Math.floor(Math.random() * 9000) + 1000) }));
    await Client.insertMany(clientDocs);
    results.push('Clients: seeded ' + clientDocs.length);

    // Seed goals
    const now = new Date();
    const goalDocs = employees.map(e => ({ employeeId: e._id, type: 'monthly', targetAmount: e.target, month: now.getMonth() + 1, year: now.getFullYear(), team: e.team }));
    await Goal.insertMany(goalDocs);
    results.push('Goals: seeded ' + goalDocs.length);

    // Seed notifications
    await Notification.insertMany([
      { type: 'deal_closed', title: 'Deal Closed!', message: 'Alex Johnson closed a $12,000 deal with GlobalMart' },
      { type: 'deal_moved', title: 'Deal Advanced', message: 'TechVision Inc moved to Negotiation stage' },
      { type: 'lead_assigned', title: 'New Lead', message: 'Hot lead Blue Horizon assigned to Marcus Chen' },
      { type: 'target_alert', title: 'Target Warning', message: 'Priya Sharma is below 50% of monthly target' },
      { type: 'deal_closed', title: 'Deal Closed!', message: 'Sarah Mitchell closed $8,500 deal with Apex Corp' },
      { type: 'deal_closed', title: 'Big Win!', message: 'Amy Thompson closed $15,300 deal with Nova Analytics' },
      { type: 'lead_assigned', title: 'New Lead', message: 'Pulse Marketing assigned to Nina Patel' },
      { type: 'deal_moved', title: 'Deal Advanced', message: 'Pinnacle Group moved to Follow-up by David Kim' },
    ]);
    results.push('Notifications: seeded 8');

    // Seed activities
    await Activity.insertMany([
      { employeeId: employees[0]._id, action: 'deal_closed', description: 'Alex Johnson closed a deal with GlobalMart for $12,000', metadata: { team: 'Team Alpha', amount: 12000 } },
      { employeeId: employees[2]._id, action: 'status_changed', description: 'Marcus Chen moved TechVision Inc to Negotiation', metadata: { team: 'Team Beta' } },
      { employeeId: employees[1]._id, action: 'deal_created', description: 'Sarah Mitchell added new deal with Stellar Systems', metadata: { team: 'Team Alpha', amount: 6500 } },
      { employeeId: employees[4]._id, action: 'lead_added', description: 'New lead assigned to Jake Williams', metadata: { team: 'Team Gamma' } },
      { employeeId: employees[3]._id, action: 'deal_closed', description: 'Priya Sharma closed deal with Blue Horizon for $9,200', metadata: { team: 'Team Beta', amount: 9200 } },
      { employeeId: employees[5]._id, action: 'deal_created', description: 'Elena Rodriguez added deal with Echo Digital', metadata: { team: 'Team Gamma', amount: 7800 } },
      { employeeId: employees[6]._id, action: 'status_changed', description: 'David Kim moved Pinnacle Group to Follow-up', metadata: { team: 'Team Delta' } },
      { employeeId: employees[7]._id, action: 'deal_closed', description: 'Amy Thompson closed deal with Nova Analytics for $15,300', metadata: { team: 'Team Delta', amount: 15300 } },
      { employeeId: employees[8]._id, action: 'lead_added', description: 'New lead Pulse Marketing assigned to Ryan OBrien', metadata: { team: 'Team Alpha' } },
      { employeeId: employees[9]._id, action: 'deal_closed', description: 'Nina Patel closed deal with Summit Tech for $11,400', metadata: { team: 'Team Beta', amount: 11400 } },
      { employeeId: employees[10]._id, action: 'deal_created', description: 'Carlos Mendez added new deal with Titan Enterprises', metadata: { team: 'Team Gamma', amount: 5600 } },
      { employeeId: employees[11]._id, action: 'deal_closed', description: 'Lily Zhang closed deal with Vanguard Co for $13,700', metadata: { team: 'Team Delta', amount: 13700 } },
    ]);
    results.push('Activities: seeded 12');

    res.json({ message: 'Full reset and seed complete', results });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
