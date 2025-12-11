import dotenv from 'dotenv';
import { connectDB } from '../config/database';
import Employee from '../models/Employee';
import Holiday from '../models/Holiday';
import Roster from '../models/Roster';
import User from '../models/User';
import mongoose from 'mongoose';

dotenv.config();

async function cleanDatabase() {
  try {
    console.log('Starting database cleanup...');

    // Connect to database
    await connectDB();
    console.log('Connected to database');

    // Delete all rosters
    const rostersDeleted = await Roster.deleteMany({});
    console.log(`✓ Deleted ${rostersDeleted.deletedCount} rosters`);

    // Delete all holidays
    const holidaysDeleted = await Holiday.deleteMany({});
    console.log(`✓ Deleted ${holidaysDeleted.deletedCount} holidays`);

    // Delete all employees
    const employeesDeleted = await Employee.deleteMany({});
    console.log(`✓ Deleted ${employeesDeleted.deletedCount} employees`);

    // Optionally delete users (uncomment if needed)
    // const usersDeleted = await User.deleteMany({});
    // console.log(`✓ Deleted ${usersDeleted.deletedCount} users`);

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
