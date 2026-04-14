const mongoose = require('mongoose');
const Employee = require('./models/Employee');
const SalesRecord = require('./models/SalesRecord');
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
