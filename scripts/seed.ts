// scripts/seed.ts
// Run to create initial owner and manager accounts in database
// Usage: npx tsx --env-file=.env.local scripts/seed.ts
import '../lib/models'; // register models
import { connectDB } from '../lib/mongodb';
import { User } from '../lib/models';
import bcrypt from 'bcryptjs';

async function seed() {
  await connectDB();

  const hash = await bcrypt.hash('changeme123', 12);

  // 1. Seed Owner Account
  const existingOwner = await User.findOne({ email: 'owner@singam.com' });
  if (!existingOwner) {
    await User.create({
      name: 'Fleet Owner',
      email: 'owner@singam.com',
      passwordHash: hash,
      role: 'owner',
    });
    console.log('✓ Seeded owner account: owner@singam.com / changeme123');
  } else {
    console.log('ℹ Owner account already exists.');
  }

  // 2. Seed Manager Account
  const existingManager = await User.findOne({ email: 'manager@singam.com' });
  if (!existingManager) {
    await User.create({
      name: 'Shift Manager',
      email: 'manager@singam.com',
      passwordHash: hash,
      role: 'manager',
    });
    console.log('✓ Seeded manager account: manager@singam.com / changeme123');
  } else {
    console.log('ℹ Manager account already exists.');
  }

  console.log('\nSeed process complete. You can now login with either role.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
