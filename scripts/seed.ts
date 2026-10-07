import mongoose from 'mongoose';
import { Staff } from '../lib/models/Staff';
import { Bus } from '../lib/models/Bus';

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB');

  console.log('\nClearing old Staff and Bus data...');
  await Staff.deleteMany({});
  await Bus.deleteMany({});
  console.log('✅ Old data cleared');

  console.log('\nSeeding 15 Staff (10 Drivers, 5 Attendants)...');
  const staffData = [
    { name: 'John Doe', role: 'driver', phone: '555-0101', monthlySalary: 3000 },
    { name: 'Jane Smith', role: 'driver', phone: '555-0102', monthlySalary: 3100 },
    { name: 'Mike Johnson', role: 'driver', phone: '555-0103', monthlySalary: 2900 },
    { name: 'Emily Davis', role: 'driver', phone: '555-0104', monthlySalary: 3200 },
    { name: 'David Brown', role: 'driver', phone: '555-0105', monthlySalary: 3050 },
    { name: 'Sarah Wilson', role: 'driver', phone: '555-0106', monthlySalary: 3000 },
    { name: 'James Taylor', role: 'driver', phone: '555-0107', monthlySalary: 3150 },
    { name: 'Linda Anderson', role: 'driver', phone: '555-0108', monthlySalary: 3100 },
    { name: 'Robert Thomas', role: 'driver', phone: '555-0109', monthlySalary: 2950 },
    { name: 'Maria Martinez', role: 'driver', phone: '555-0110', monthlySalary: 3250 },
    { name: 'William Garcia', role: 'attendant', phone: '555-0201', monthlySalary: 2000 },
    { name: 'Jessica Robinson', role: 'attendant', phone: '555-0202', monthlySalary: 2100 },
    { name: 'Richard Clark', role: 'attendant', phone: '555-0203', monthlySalary: 2050 },
    { name: 'Susan Rodriguez', role: 'attendant', phone: '555-0204', monthlySalary: 1950 },
    { name: 'Joseph Lewis', role: 'attendant', phone: '555-0205', monthlySalary: 2200 },
  ];

  await Staff.insertMany(staffData);
  console.log('✅ Staff seeded successfully');

  console.log('\nSeeding 5 Active Buses (without default staff)...');
  const busData = [
    { plateNumber: 'KL 01 A 1111', name: 'Express One', status: 'active' },
    { plateNumber: 'KL 02 B 2222', name: 'Express Two', status: 'active' },
    { plateNumber: 'KL 03 C 3333', name: 'Express Three', status: 'active' },
    { plateNumber: 'KL 04 D 4444', name: 'City Ride', status: 'active' },
    { plateNumber: 'KL 05 E 5555', name: 'Night Owl', status: 'active' },
  ];

  await Bus.insertMany(busData);
  console.log('✅ Buses seeded successfully');

  console.log('\n🎉 Seeding complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Error seeding data:', err);
  process.exit(1);
});
