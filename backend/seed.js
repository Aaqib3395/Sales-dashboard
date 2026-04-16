const mongoose = require('mongoose');
const Employee = require('./models/Employee');
const SalesRecord = require('./models/SalesRecord');
const User = require('./models/User');
const Client = require('./models/Client');
const Notification = require('./models/Notification');
const Activity = require('./models/Activity');
const Goal = require('./models/Goal');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sales_dashboard';

const employees = [
  { name: 'Alex Johnson', email: 'alex.j@flowtech.com', role: 'Sales Manager', team: 'Team Alpha', target: 80000, phone: '+1-555-0101' },
  { name: 'Sarah Mitchell', email: 'sarah.m@flowtech.com', role: 'Senior Sales Rep', team: 'Team Alpha', target: 60000, phone: '+1-555-0102' },
  { name: 'Marcus Chen', email: 'marcus.c@flowtech.com', role: 'Account Executive', team: 'Team Beta', target: 55000, phone: '+1-555-0103' },
  { name: 'Priya Sharma', email: 'priya.s@flowtech.com', role: 'Sales Rep', team: 'Team Beta', target: 40000, phone: '+1-555-0104' },
  { name: 'Jake Williams', email: 'jake.w@flowtech.com', role: 'Team Lead', team: 'Team Gamma', target: 70000, phone: '+1-555-0105' },
  { name: 'Elena Rodriguez', email: 'elena.r@flowtech.com', role: 'Senior Sales Rep', team: 'Team Gamma', target: 58000, phone: '+1-555-0106' },
  { name: 'David Kim', email: 'david.k@flowtech.com', role: 'Sales Rep', team: 'Team Delta', target: 42000, phone: '+1-555-0107' },
  { name: 'Amy Thompson', email: 'amy.t@flowtech.com', role: 'Account Executive', team: 'Team Delta', target: 52000, phone: '+1-555-0108' },
  { name: 'Ryan O\'Brien', email: 'ryan.o@flowtech.com', role: 'Sales Rep', team: 'Team Alpha', target: 38000, phone: '+1-555-0109' },
  { name: 'Nina Patel', email: 'nina.p@flowtech.com', role: 'Senior Sales Rep', team: 'Team Beta', target: 62000, phone: '+1-555-0110' },
  { name: 'Carlos Mendez', email: 'carlos.m@flowtech.com', role: 'Sales Rep', team: 'Team Gamma', target: 45000, phone: '+1-555-0111' },
  { name: 'Lily Zhang', email: 'lily.z@flowtech.com', role: 'Team Lead', team: 'Team Delta', target: 72000, phone: '+1-555-0112' },
];

const products = ['Enterprise CRM', 'Pro Analytics', 'Sales Suite', 'Marketing Hub', 'Data Pipeline', 'Cloud Integration', 'AI Assistant', 'Custom Reporting'];
const clients = ['GlobalMart', 'TechVision Inc', 'Bright Solutions', 'Apex Corp', 'Blue Horizon', 'NextGen Ltd', 'Prime Goods', 'Summit Tech', 'Stellar Systems', 'Vanguard Co', 'Pinnacle Group', 'Echo Digital', 'Rapid Growth LLC', 'Titan Enterprises', 'Nova Analytics', 'Pulse Marketing'];
const statuses = ['lead', 'follow-up', 'negotiation', 'closed'];
const statusWeights = [0.2, 0.25, 0.2, 0.35]; // closed weighted higher

function pickWeighted(arr, weights) {
  const rand = Math.random();
  let cumulative = 0;
  for (let i = 0; i < arr.length; i++) {
    cumulative += weights[i];
    if (rand <= cumulative) return arr[i];
  }
  return arr[arr.length - 1];
}

function randomDate(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date;
}

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Employee.deleteMany({});
    await SalesRecord.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Insert employees
    const savedEmployees = await Employee.insertMany(employees);
    console.log(`👤 Inserted ${savedEmployees.length} employees`);

    // Generate sales records - last 12 months
    const records = [];
    const totalRecords = 800;

    for (let i = 0; i < totalRecords; i++) {
      const emp = savedEmployees[Math.floor(Math.random() * savedEmployees.length)];
      const status = pickWeighted(statuses, statusWeights);
      const amount = Math.floor(Math.random() * 18000) + 2000;
      const probability = status === 'closed' ? 100 : status === 'negotiation' ? Math.floor(Math.random() * 30) + 60 : status === 'follow-up' ? Math.floor(Math.random() * 30) + 30 : Math.floor(Math.random() * 30) + 10;

      records.push({
        employeeId: emp._id,
        date: randomDate(365),
        amount,
        status,
        clientName: clients[Math.floor(Math.random() * clients.length)],
        product: products[Math.floor(Math.random() * products.length)],
        probability,
        notes: status === 'lead' ? 'Initial contact made' : status === 'follow-up' ? 'Sent proposal, awaiting response' : status === 'negotiation' ? 'In contract discussions' : 'Deal signed and closed',
      });
    }

    await SalesRecord.insertMany(records);
    console.log(`📊 Inserted ${records.length} sales records`);

    // Clear and seed Users
    await User.deleteMany({});
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@flowtech.com',
      password: 'admin123',
      role: 'Admin',
      team: '',
    });
    await adminUser.save();

    const managerUser = new User({
      name: 'Alex Johnson',
      email: 'alex.j@flowtech.com',
      password: 'manager123',
      role: 'Manager',
      team: 'Team Alpha',
      employeeId: savedEmployees[0]._id,
    });
    await managerUser.save();

    const repUser = new User({
      name: 'Sarah Mitchell',
      email: 'sarah.m@flowtech.com',
      password: 'sales123',
      role: 'Sales Rep',
      team: 'Team Alpha',
      employeeId: savedEmployees[1]._id,
    });
    await repUser.save();
    console.log('👤 Inserted 3 users (admin, manager, sales rep)');

    // Seed Clients from unique client names
    await Client.deleteMany({});
    const clientDocs = clients.map((name) => ({
      name,
      company: name,
      email: `contact@${name.toLowerCase().replace(/\s+/g, '')}.com`,
      phone: `+1-555-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      notes: 'Auto-generated client record',
    }));
    await Client.insertMany(clientDocs);
    console.log(`🏢 Inserted ${clientDocs.length} clients`);

    // Seed Goals for current month
    await Goal.deleteMany({});
    const now = new Date();
    const goalDocs = savedEmployees.map((emp) => ({
      employeeId: emp._id,
      type: 'monthly',
      targetAmount: emp.target,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      team: emp.team,
    }));
    await Goal.insertMany(goalDocs);
    console.log(`🎯 Inserted ${goalDocs.length} goals`);

    // Seed some notifications
    await Notification.deleteMany({});
    const notifDocs = [
      { type: 'deal_closed', title: 'Deal Closed!', message: `${savedEmployees[0].name} closed a $12,000 deal with GlobalMart`, userId: null },
      { type: 'deal_moved', title: 'Deal Advanced', message: `TechVision Inc moved to Negotiation stage`, userId: null },
      { type: 'lead_assigned', title: 'New Lead Assigned', message: `Hot lead Blue Horizon assigned to ${savedEmployees[2].name}`, userId: null },
      { type: 'target_alert', title: 'Target Warning', message: `${savedEmployees[3].name} is below 50% of monthly target`, userId: null },
      { type: 'deal_closed', title: 'Deal Closed!', message: `${savedEmployees[1].name} closed a $8,500 deal with Apex Corp`, userId: null },
    ];
    await Notification.insertMany(notifDocs);
    console.log('🔔 Inserted sample notifications');

    // Seed activities
    await Activity.deleteMany({});
    const activityDocs = [
      { employeeId: savedEmployees[0]._id, action: 'deal_closed', description: `${savedEmployees[0].name} closed a deal with GlobalMart for $12,000`, metadata: { team: 'Team Alpha', amount: 12000 } },
      { employeeId: savedEmployees[2]._id, action: 'status_changed', description: `${savedEmployees[2].name} moved TechVision Inc to Negotiation`, metadata: { team: 'Team Beta', from: 'follow-up', to: 'negotiation' } },
      { employeeId: savedEmployees[1]._id, action: 'deal_created', description: `${savedEmployees[1].name} added new deal with Stellar Systems`, metadata: { team: 'Team Alpha', amount: 6500 } },
      { employeeId: savedEmployees[4]._id, action: 'lead_added', description: `New lead Rapid Growth LLC assigned to ${savedEmployees[4].name}`, metadata: { team: 'Team Gamma' } },
      { employeeId: savedEmployees[3]._id, action: 'deal_closed', description: `${savedEmployees[3].name} closed a deal with Blue Horizon for $9,200`, metadata: { team: 'Team Beta', amount: 9200 } },
    ];
    await Activity.insertMany(activityDocs);
    console.log('📋 Inserted sample activities');

    // Summary
    const closedCount = records.filter((r) => r.status === 'closed').length;
    const totalRevenue = records.filter((r) => r.status === 'closed').reduce((sum, r) => sum + r.amount, 0);
    console.log(`\n📈 Seed Summary:`);
    console.log(`   Total records: ${records.length}`);
    console.log(`   Closed deals: ${closedCount}`);
    console.log(`   Total revenue: $${totalRevenue.toLocaleString()}`);
    console.log(`\n✅ Seed completed successfully!`);

  } catch (err) {
    console.error('❌ Seed error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
