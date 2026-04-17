const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const MenuItem = require('./models/MenuItem');
const Table = require('./models/Table');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/qr_food_ordering';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Create admin user
    const existingAdmin = await User.findOne({ email: 'admin@gmail.com' });
    if (!existingAdmin) {
      await User.create({ name: 'Admin', email: 'admin@gmail.com', password: 'admin123', role: 'admin' });
      console.log('✅ Admin user created: admin@gmail.com / admin123');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Create sample tables
    const tableCount = await Table.countDocuments();
    if (tableCount === 0) {
      for (let i = 1; i <= 10; i++) {
        const table = new Table({ tableNumber: i, capacity: i <= 4 ? 2 : i <= 8 ? 4 : 6, location: i <= 5 ? 'Main Hall' : 'Terrace' });
        await table.generateQRCode(CLIENT_URL);
        await table.save();
      }
      console.log('✅ 10 tables created with QR codes');
    } else {
      console.log(`ℹ️  ${tableCount} tables already exist`);
    }

    console.log('\n🚀 Seed complete! Start the server with: npm run dev');
    console.log('📋 Admin login: admin@lacucina.com / admin123');
    console.log(`📱 Customer menu: ${CLIENT_URL}/menu?table=1`);
  } catch (err) {
    console.error('❌ Seed error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
