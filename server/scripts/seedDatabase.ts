import dotenv from 'dotenv';
import { connectDB } from '../config/database';
import Employee from '../models/Employee';
import User from '../models/User';
import { generatePasswordHash } from '../utils/password';
import { ROLES } from 'shared';
// No mongoose required when using CSV-backed storage

dotenv.config();

const seedEmployees = [
  // Developers (20)
  { name: 'John Smith', email: 'john.smith@company.com', department: 'Developer' as const },
  { name: 'Sarah Johnson', email: 'sarah.j@company.com', department: 'Developer' as const },
  { name: 'Michael Chen', email: 'michael.c@company.com', department: 'Developer' as const },
  { name: 'Emily Davis', email: 'emily.d@company.com', department: 'Developer' as const },
  { name: 'David Wilson', email: 'david.w@company.com', department: 'Developer' as const },
  { name: 'Jessica Brown', email: 'jessica.b@company.com', department: 'Developer' as const },
  { name: 'James Taylor', email: 'james.t@company.com', department: 'Developer' as const },
  { name: 'Lisa Anderson', email: 'lisa.a@company.com', department: 'Developer' as const },
  { name: 'Robert Martinez', email: 'robert.m@company.com', department: 'Developer' as const },
  { name: 'Amanda White', email: 'amanda.w@company.com', department: 'Developer' as const },
  { name: 'Christopher Lee', email: 'chris.l@company.com', department: 'Developer' as const },
  { name: 'Michelle Garcia', email: 'michelle.g@company.com', department: 'Developer' as const },
  { name: 'Daniel Rodriguez', email: 'daniel.r@company.com', department: 'Developer' as const },
  { name: 'Jennifer Lopez', email: 'jennifer.l@company.com', department: 'Developer' as const },
  { name: 'Matthew Harris', email: 'matthew.h@company.com', department: 'Developer' as const },
  { name: 'Ashley Clark', email: 'ashley.c@company.com', department: 'Developer' as const },
  { name: 'Joshua Lewis', email: 'joshua.l@company.com', department: 'Developer' as const },
  { name: 'Stephanie Walker', email: 'stephanie.w@company.com', department: 'Developer' as const },
  { name: 'Andrew Hall', email: 'andrew.h@company.com', department: 'Developer' as const },
  { name: 'Nicole Young', email: 'nicole.y@company.com', department: 'Developer' as const },
  // Ops (5)
  { name: 'Kevin King', email: 'kevin.k@company.com', department: 'Ops' as const },
  { name: 'Rachel Wright', email: 'rachel.w@company.com', department: 'Ops' as const },
  { name: 'Brian Scott', email: 'brian.s@company.com', department: 'Ops' as const },
  { name: 'Laura Green', email: 'laura.g@company.com', department: 'Ops' as const },
  { name: 'Steven Adams', email: 'steven.a@company.com', department: 'Ops' as const },
  // Platform (5)
  { name: 'Karen Baker', email: 'karen.b@company.com', department: 'Platform' as const },
  { name: 'Thomas Nelson', email: 'thomas.n@company.com', department: 'Platform' as const },
  { name: 'Patricia Carter', email: 'patricia.c@company.com', department: 'Platform' as const },
  { name: 'Richard Mitchell', email: 'richard.m@company.com', department: 'Platform' as const },
  { name: 'Maria Perez', email: 'maria.p@company.com', department: 'Platform' as const },
];

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // Connect to database
    await connectDB();
    console.log('Connected to database');

    // Check if data already exists
    const existingEmployees = await Employee.countDocuments();
    if (existingEmployees > 0) {
      console.log(`Database already has ${existingEmployees} employees. Skipping employee seeding.`);
    } else {
      console.log('Seeding employees...');

      // Seed employees with auto-generated employee IDs
      const employeePromises = seedEmployees.map(async (emp, index) => {
        const department = emp.department;
        let prefix = '';
        let count = 0;

        switch (department) {
          case 'Developer':
            count = seedEmployees.slice(0, index + 1).filter(e => e.department === 'Developer').length;
            prefix = 'DEV';
            break;
          case 'Ops':
            count = seedEmployees.slice(0, index + 1).filter(e => e.department === 'Ops').length;
            prefix = 'OPS';
            break;
          case 'Platform':
            count = seedEmployees.slice(0, index + 1).filter(e => e.department === 'Platform').length;
            prefix = 'PLT';
            break;
        }

        const employeeId = `${prefix}${String(count).padStart(3, '0')}`;

        return Employee.create({
          name: emp.name,
          email: emp.email,
          department: emp.department,
          employeeId,
          status: 'Available',
        });
      });

      await Promise.all(employeePromises);
      console.log(`✓ Seeded ${seedEmployees.length} employees successfully`);
    }

    // Check if admin user exists
    const existingAdmin = await User.findByEmail('admin@rostermate.com');
    if (existingAdmin) {
      console.log('Admin user already exists. Skipping admin user creation.');
    } else {
      console.log('Creating admin user...');

      const adminPassword = await generatePasswordHash('admin123');
      await User.create({
        email: 'admin@rostermate.com',
        password: adminPassword,
        role: ROLES.ADMIN,
        isActive: true,
      });
      console.log('✓ Admin user created successfully');
      console.log('  Email: admin@rostermate.com');
      console.log('  Password: admin123');
    }

    // Check if regular user exists
    const existingUser = await User.findByEmail('user@rostermate.com');
    if (existingUser) {
      console.log('Regular user already exists. Skipping regular user creation.');
    } else {
      console.log('Creating regular user...');

      const userPassword = await generatePasswordHash('user123');
      await User.create({
        email: 'user@rostermate.com',
        password: userPassword,
        role: ROLES.USER,
        isActive: true,
      });
      console.log('✓ Regular user created successfully');
      console.log('  Email: user@rostermate.com');
      console.log('  Password: user123');
    }

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\nYou can now login with:');
    console.log('  Admin: admin@rostermate.com / admin123');
    console.log('  User: user@rostermate.com / user123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();
