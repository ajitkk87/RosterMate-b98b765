import dotenv from 'dotenv';
import { connectDB, csvDb } from '../config/database';
import Employee from '../models/Employee';
import Holiday from '../models/Holiday';
import Roster from '../models/Roster';
import User from '../models/User';

dotenv.config();

async function cleanDatabase() {
  try {
    console.log('Starting database cleanup...');

    // Connect to database
    await connectDB();
    console.log('Connected to database');

    // Delete all rosters
    await csvDb.deleteAll('rosters');
    console.log(`✓ Deleted all rosters`);

    // Delete all holidays
    await csvDb.deleteAll('holidays');
    console.log(`✓ Deleted all holidays`);

    // Delete all employees
    await csvDb.deleteAll('employees');
    console.log(`✓ Deleted all employees`);

    // Optionally delete users (uncomment if needed)
    // await csvDb.deleteAll('users');
    // console.log(`✓ Deleted all users`);

    console.log('\n✅ Database cleanup completed successfully!');
    console.log('Note: Users were not deleted. Run seedDatabase.ts to repopulate data.');

    process.exit(0);
  } catch (error) {
    console.error('Error cleaning database:', error);
    process.exit(1);
  }
}

// Run the clean function
cleanDatabase();
