require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Create central admin if not exists
  const existingAdmin = await User.findOne({ nicId: process.env.ADMIN_NIC_ID || 'CENTRAL-ADMIN-001' });
  if (!existingAdmin) {
    await User.create({
      nicId:       process.env.ADMIN_NIC_ID       || 'CENTRAL-ADMIN-001',
      name:        process.env.ADMIN_NAME         || 'System Administrator',
      email:       process.env.ADMIN_EMAIL        || 'admin@gov.in',
      phone:       process.env.ADMIN_PHONE        || '9999999999',
      password:    process.env.ADMIN_PASSWORD,
      role:        'CENTRAL_ADMIN',
      isActive:    true,
      isVerified:  true,
      aadhaarVerified: false,
      designation: 'System Administrator',
      department:  'Ministry of Finance',
    });
    console.log('\n✅ Bootstrap admin created!');
    console.log('⚠️  CHANGE PASSWORD AND PHONE IMMEDIATELY AFTER FIRST LOGIN!\n');
    console.log(`NIC ID:    ${process.env.ADMIN_NIC_ID || 'CENTRAL-ADMIN-001'}`);
    console.log(`Email:     ${process.env.ADMIN_EMAIL || 'admin@gov.in'}`);
  } else {
    console.log('Admin already exists. Skipping admin creation.');
  }

  // Create test users for OTP-free testing
  const testUsers = [
    {
      nicId: 'OFFICER-001',
      name: 'Test State Officer',
      email: 'officer001@test.gov.in',
      phone: '9123456781',
      password: 'Officer@123',
      role: 'STATE_OFFICER',
      stateCode: 'MH',
      isActive: true,
      isVerified: true,
      aadhaarVerified: false,
      designation: 'State Project Officer',
      department: 'State Finance Department',
    },
    {
      nicId: 'CONTRACTOR-001',
      name: 'Test Contractor',
      email: 'contractor001@test.gov.in',
      phone: '9123456782',
      password: 'Contractor@123',
      role: 'CONTRACTOR',
      stateCode: 'MH',
      isActive: true,
      isVerified: true,
      aadhaarVerified: true,
      designation: 'Registered Contractor',
      department: 'Infrastructure Development',
    },
  ];

  let createdCount = 0;
  for (const userData of testUsers) {
    const existing = await User.findOne({ nicId: userData.nicId });
    if (!existing) {
      await User.create(userData);
      console.log(`\n✅ Test user created: ${userData.nicId} (${userData.role})`);
      console.log(`   Login: ${userData.nicId} / ${userData.password}`);
      createdCount++;
    } else {
      console.log(`\nℹ️  Test user already exists: ${userData.nicId}`);
    }
  }

  console.log(`\n📊 Summary: ${createdCount} new test users created`);
  process.exit(0);
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
