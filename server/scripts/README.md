# Database Scripts

This directory contains utility scripts for managing the RosterMate database.

## Available Scripts

### 1. Seed Database (`seedDatabase.ts`)

Populates the database with initial data including:
- 30 employees (20 Developers, 5 Ops, 5 Platform)
- Admin user account
- Regular user account

**Usage:**
```bash
cd server
npm run seed
```

**Created accounts:**
- Admin: `admin@rostermate.com` / `admin123`
- User: `user@rostermate.com` / `user123`

**Features:**
- Automatically generates employee IDs (DEV001-DEV020, OPS001-OPS005, PLT001-PLT005)
- Skips seeding if data already exists (idempotent)
- Sets all employees to "Available" status by default

### 2. Clean Database (`cleanDatabase.ts`)

Removes all data from the database except user accounts.

**Usage:**
```bash
cd server
npm run clean
```

**What it deletes:**
- All rosters
- All holidays
- All employees

**What it preserves:**
- User accounts (admin and regular users)

**Note:** After cleaning, you can run `npm run seed` to repopulate the database.

## Common Workflows

### Reset Database to Initial State
```bash
cd server
npm run clean
npm run seed
```

### Test with Fresh Data
```bash
cd server
npm run clean
npm run seed
npm run dev
```

## Script Details

### seedDatabase.ts
- Connects to MongoDB using the DATABASE_URL from `.env`
- Creates employees with proper department prefixes
- Hashes passwords using bcrypt
- Provides detailed console output during execution
- Exits with code 0 on success, 1 on error

### cleanDatabase.ts
- Safely removes operational data while preserving user accounts
- Provides count of deleted items
- Useful for testing and development
- Exits with code 0 on success, 1 on error

## Development Tips

1. **Before Testing Roster Generation:** Ensure you have seeded employees
2. **Testing Holiday Features:** Use the seeded employees to create holiday requests
3. **Reset Between Tests:** Run clean + seed to ensure consistent test data
4. **Production Warning:** Never run these scripts on production databases!

## Troubleshooting

### "Database already has X employees"
This means data already exists. Run `npm run clean` first if you want to reseed.

### Connection Errors
Ensure your `.env` file has the correct `DATABASE_URL` set:
```
DATABASE_URL=mongodb://localhost:27017/rostermate
```

### Permission Errors
Make sure MongoDB is running and accessible:
```bash
# Check if MongoDB is running
mongosh
```

## Adding More Seed Data

To customize the seed data, edit the `seedEmployees` array in `seedDatabase.ts`. Each employee needs:
- `name`: Full name
- `email`: Unique email address
- `department`: One of 'Developer', 'Ops', or 'Platform'

The script automatically:
- Generates unique employee IDs
- Sets status to 'Available'
- Creates timestamps
