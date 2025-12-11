# MongoDB to CSV Migration - Summary

## Overview
The RosterMate backend has been migrated from MongoDB to CSV file-based storage. All data is now stored in CSV files instead of a database server.

## Changes Made

### 1. New CSV Database Layer
**File**: `server/utils/csv-db.ts`
- Created a `CsvDatabase` class that provides MongoDB-like operations (find, findOne, insertOne, updateOne, deleteOne, etc.)
- Handles automatic ID generation with UUIDs
- Reads/writes CSV files using the `csv` npm package
- Stores data in `./data` directory (configurable via `CSV_DATA_DIR` env var)

### 2. Database Configuration
**File**: `server/config/database.ts`
- Changed from `mongoose.connect()` to CSV database initialization
- Uses `CSV_DATA_DIR` environment variable (defaults to `./data`)
- No need for DATABASE_URL anymore

### 3. Models Updated
All models converted from Mongoose schemas to simple class-based models:

- **User** (`server/models/User.ts`)
  - Methods: create, findById, findByEmail, findByRefreshToken, find, updateOne, deleteOne, countDocuments
  
- **Employee** (`server/models/Employee.ts`)
  - Methods: create, findById, findByEmail, findByEmployeeId, find, updateOne, deleteOne, countDocuments
  
- **Holiday** (`server/models/Holiday.ts`)
  - Methods: create, findById, findByEmployeeId, findByStatus, find, updateOne, deleteOne, countDocuments
  
- **Roster** (`server/models/Roster.ts`)
  - Methods: create, findById, findByWeekStartDate, find, updateOne, deleteOne, countDocuments
  - Stores duty assignments as JSON strings in CSV

### 4. Environment Configuration
**File**: `server/.env`
- Removed `DATABASE_URL` variable
- Added `CSV_DATA_DIR` variable (optional, defaults to `./data`)

### 5. Dependencies
**File**: `server/package.json`
- Added: `csv` package (v6.3.8) for CSV parsing/writing
- Removed: `mongoose` and `connect-mongo` packages

### 6. Server Entry Point
**File**: `server/server.ts`
- Removed MongoDB URL validation check
- Now uses CSV-based database initialization

## CSV File Structure

Data is stored in the `./data` directory with the following CSV files:

- `users.csv` - User accounts with authentication info
- `employees.csv` - Employee records
- `holidays.csv` - Holiday requests
- `rosters.csv` - Duty rosters with assignments

Each record has an auto-generated `_id` (UUID) for unique identification.

## Setup

### First Time Setup
1. **Install dependencies**:
   ```bash
   cd server
   npm install
   ```

2. **Configure environment** (`.env` file):
   ```
   PORT=3000
   CSV_DATA_DIR=./data
   JWT_SECRET=your-secret-key
   JWT_REFRESH_SECRET=your-refresh-secret
   SESSION_SECRET=your-session-secret
   ```

3. **Start the server**:
   ```bash
   npm run dev
   ```

   Data files will be auto-created in the `./data` directory on first use.

4. **Seed sample data** (if needed):
   ```bash
   npm run seed
   ```

### Data Persistence
- Data is stored in CSV files in the `./data` directory
- This directory should be backed up regularly
- CSV files are human-readable and can be edited manually if needed

## Advantages of CSV-based Storage

✅ **No database setup** - No MongoDB server to install/configure
✅ **Portable** - CSV files can be easily shared, backed up, version controlled
✅ **Human-readable** - Edit data directly in spreadsheet apps if needed
✅ **Lightweight** - Minimal dependencies, small memory footprint
✅ **Development-friendly** - No external services needed

## Limitations

⚠️ **Single-threaded writes** - Not suitable for high-concurrency scenarios
⚠️ **No transactions** - No ACID guarantees like databases provide
⚠️ **Limited querying** - Simple filter matching (not complex queries)
⚠️ **Performance** - Slower than databases for large datasets
⚠️ **No indexing** - Full table scans for every query

## Notes

- Date fields are stored as ISO 8601 strings in CSV files
- Complex objects (like roster assignments) are stored as JSON strings
- All queries are in-memory filtering - keep datasets reasonably sized
- For production use, consider migrating back to MongoDB or another database

## Services That Still Work

All existing services and routes continue to work as before:
- Authentication (JWT-based)
- Employee management
- Holiday requests
- Roster generation and management
- All API endpoints

The CSV layer is transparent to the route handlers and services - they use the same interface.
