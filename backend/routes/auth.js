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
router.post('/seed-users', async (req, res) => {
  try {
    const User = require('../models/User');
    const Client = require('../models/Client');
    const Notification = require('../models/Notification');
    const Activity = require('../models/Activity');
    const Goal = require('../models/Goal');
    const Employee = require('../models/Employee');
    const results = [];

    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const employees = await Employee.find();
      const users = [
        { name: 'Admin User', email: 'admin@flowtech.com', password: 'admin123', role: 'Admin' },
        { name: 'Alex Johnson', email: 'alex.j@flowtech.com', password: 'manager123', role: 'Manager', team: 'Team Alpha', employeeId: employees.find(e => e.name === 'Alex Johnson')?._id },
        { name: 'Sarah Mitchell', email: 'sarah.m@flowtech.com', password: 'sales123', role: 'Manager', team: 'Team Alpha', employeeId: employees.find(e => e.name === 'Sarah Mitchell')?._id },
        { name: 'Marcus Chen', email: 'marcus.c@flowtech.com', password: 'sales123', role: 'Sales Rep', team: 'Team Beta', employeeId: employees.find(e => e.name === 'Marcus Chen')?._id },
        { name: 'Priya Sharma', email: 'priya.s@flowtech.com', password: 'sales123', role: 'Sales Rep', team: 'Team Beta', employeeId: employees.find(e => e.name === 'Priya Sharma')?._id },
        { name: 'Jake Williams', email: 'jake.w@flowtech.com', password: 'sales123', role: 'Manager', team: 'Team Gamma', employeeId: employees.find(e => e.name === 'Jake Williams')?._id },
        { name: 'Elena Rodriguez', email: 'elena.r@flowtech.com', password: 'sales123', role: 'Sales Rep', team: 'Team Gamma', employeeId: employees.find(e => e.name === 'Elena Rodriguez')?._id },
        { name: 'David Kim', email: 'david.k@flowtech.com', password: 'sales123', role: 'Sales Rep', team: 'Team Delta', employeeId: employees.find(e => e.name === 'David Kim')?._id },
        { name: 'Amy Thompson', email: 'amy.t@flowtech.com', password: 'sales123', role: 'Sales Rep', team: 'Team Delta', employeeId: employees.find(e => e.name === 'Amy Thompson')?._id },
        { name: 'Ryan OBrien', email: 'ryan.o@flowtech.com', password: 'sales123', role: 'Sales Rep', team: 'Team Alpha', employeeId: employees.find(e => e.name === "Ryan O'Brien")?._id },
        { name: 'Nina Patel', email: 'nina.p@flowtech.com', password: 'sales123', role: 'Sales Rep', team: 'Team Beta', employeeId: employees.find(e => e.name === 'Nina Patel')?._id },
        { name: 'Carlos Mendez', email: 'carlos.m@flowtech.com', password: 'sales123', role: 'Sales Rep', team: 'Team Gamma', employeeId: employees.find(e => e.name === 'Carlos Mendez')?._id },
        { name: 'Lily Zhang', email: 'lily.z@flowtech.com', password: 'sales123', role: 'Manager', team: 'Team Delta', employeeId: employees.find(e => e.name === 'Lily Zhang')?._id },
      ];
      for (const u of users) { const user = new User(u); await user.save(); }
      results.push('Users: seeded 13');
    } else {
      results.push('Users: already exist (' + userCount + ')');
    }

    const clientCount = await Client.countDocuments();
    if (clientCount === 0) {
      const clients = ['GlobalMart','TechVision Inc','Bright Solutions','Apex Corp','Blue Horizon','NextGen Ltd','Prime Goods','Summit Tech','Stellar Systems','Vanguard Co','Pinnacle Group','Echo Digital','Rapid Growth LLC','Titan Enterprises','Nova Analytics','Pulse Marketing'];
      const clientDocs = clients.map(name => ({ name, company: name, email: 'contact@' + name.toLowerCase().replace(/\s+/g, '') + '.com', phone: '+1-555-' + String(Math.floor(Math.random() * 9000) + 1000), notes: 'Client record' }));
      await Client.insertMany(clientDocs);
      results.push('Clients: seeded ' + clientDocs.length);
    } else {
      results.push('Clients: already exist (' + clientCount + ')');
    }

    const goalCount = await Goal.countDocuments();
    if (goalCount === 0) {
      const employees = await Employee.find();
      const now = new Date();
      const goalDocs = employees.map(emp => ({ employeeId: emp._id, type: 'monthly', targetAmount: emp.target, month: now.getMonth() + 1, year: now.getFullYear(), team: emp.team }));
      await Goal.insertMany(goalDocs);
      results.push('Goals: seeded ' + goalDocs.length);
    } else {
      results.push('Goals: already exist (' + goalCount + ')');
    }

    const notifCount = await Notification.countDocuments();
    if (notifCount === 0) {
      const notifs = [
        { type: 'deal_closed', title: 'Deal Closed!', message: 'Alex Johnson closed a $12,000 deal with GlobalMart' },
        { type: 'deal_moved', title: 'Deal Advanced', message: 'TechVision Inc moved to Negotiation stage' },
        { type: 'lead_assigned', title: 'New Lead Assigned', message: 'Hot lead Blue Horizon assigned to Marcus Chen' },
        { type: 'target_alert', title: 'Target Warning', message: 'Priya Sharma is below 50% of monthly target' },
        { type: 'deal_closed', title: 'Deal Closed!', message: 'Sarah Mitchell closed a $8,500 deal with Apex Corp' },
      ];
      await Notification.insertMany(notifs);
      results.push('Notifications: seeded 5');
    } else {
      results.push('Notifications: already exist (' + notifCount + ')');
    }

    const actCount = await Activity.countDocuments();
    if (actCount === 0) {
      const employees = await Employee.find();
      const activities = [
        { employeeId: employees[0]?._id, action: 'deal_closed', description: 'Alex Johnson closed a deal with GlobalMart for $12,000', metadata: { team: 'Team Alpha', amount: 12000 } },
        { employeeId: employees[2]?._id, action: 'status_changed', description: 'Marcus Chen moved TechVision Inc to Negotiation', metadata: { team: 'Team Beta', from: 'follow-up', to: 'negotiation' } },
        { employeeId: employees[1]?._id, action: 'deal_created', description: 'Sarah Mitchell added new deal with Stellar Systems', metadata: { team: 'Team Alpha', amount: 6500 } },
        { employeeId: employees[4]?._id, action: 'lead_added', description: 'New lead Rapid Growth LLC assigned to Jake Williams', metadata: { team: 'Team Gamma' } },
        { employeeId: employees[3]?._id, action: 'deal_closed', description: 'Priya Sharma closed a deal with Blue Horizon for $9,200', metadata: { team: 'Team Beta', amount: 9200 } },
        { employeeId: employees[5]?._id, action: 'deal_created', description: 'Elena Rodriguez added new deal with Echo Digital', metadata: { team: 'Team Gamma', amount: 7800 } },
        { employeeId: employees[6]?._id, action: 'status_changed', description: 'David Kim moved Pinnacle Group to Follow-up', metadata: { team: 'Team Delta', from: 'lead', to: 'follow-up' } },
        { employeeId: employees[7]?._id, action: 'deal_closed', description: