# RosterMate - Project Export & Sharing Guide

This guide explains how to export and share the RosterMate project with other developers or deploy it to different environments.

## Table of Contents
1. [Project Overview](#project-overview)
2. [Exporting the Project](#exporting-the-project)
3. [Setting Up for a New Developer](#setting-up-for-a-new-developer)
4. [Database Management](#database-management)
5. [Deployment Checklist](#deployment-checklist)
6. [Sharing Best Practices](#sharing-best-practices)

---

## Project Overview

**RosterMate** is an Employee Duty Roster Management System built with:
- **Frontend:** React (Vite), TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Node.js, Express, TypeScript
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT-based auth with access and refresh tokens

---

## Exporting the Project

### 1. Prepare the Project

```bash
# Clean node_modules to reduce size
rm -rf node_modules client/node_modules server/node_modules shared/node_modules

# Clean build artifacts
rm -rf client/dist server/dist shared/dist

# Clean logs and temporary files
rm -rf *.log .DS_Store
```

### 2. Create Archive

```bash
# From project root
tar -czf rostermate-export.tar.gz \
  --exclude='node_modules' \
  --exclude='dist' \
  --exclude='.git' \
  --exclude='*.log' \
  .

# Or create a zip file
zip -r rostermate-export.zip . \
  -x "node_modules/*" \
  -x "*/node_modules/*" \
  -x "dist/*" \
  -x "*/dist/*" \
  -x ".git/*" \
  -x "*.log"
```

### 3. Using Git (Recommended)

```bash
# Initialize git repository (if not already)
git init

# Add all files (gitignore will exclude unnecessary files)
git add .

# Commit
git commit -m "Initial commit - RosterMate v1.0"

# Push to remote repository
git remote add origin <your-repo-url>
git push -u origin main
```

---

## Setting Up for a New Developer

### Prerequisites
- Node.js 20+ and npm
- MongoDB 8.0+ (local or remote)
- Git (optional)

### Step-by-Step Setup

#### 1. Extract/Clone the Project

```bash
# If using Git
git clone <repository-url>
cd rostermate

# If using archive
tar -xzf rostermate-export.tar.gz
# or
unzip rostermate-export.zip
cd rostermate
```

#### 2. Install Dependencies

```bash
# Install all dependencies (root, client, server, shared)
npm install

# This will automatically install dependencies in all subdirectories
```

#### 3. Configure Environment Variables

Create `.env` file in the `server` directory:

```bash
cd server
cat > .env << EOL
# Server Configuration
PORT=3000

# Database
DATABASE_URL=mongodb://localhost:27017/rostermate

# JWT Secrets (change these in production!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production

# Session Secret
SESSION_SECRET=your-session-secret-change-this-in-production
EOL
```

**Important:** Change all secrets in production!

#### 4. Start MongoDB

```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:8.0

# Or start local MongoDB
mongod --dbpath /path/to/data/directory

# Or use MongoDB Atlas (cloud)
# Update DATABASE_URL in .env with your connection string
```

#### 5. Seed the Database

```bash
cd server
npm run seed
```

This creates:
- 30 employees (20 Developers, 5 Ops, 5 Platform)
- Admin user: `admin@rostermate.com` / `admin123`
- Regular user: `user@rostermate.com` / `user123`

#### 6. Start the Application

```bash
# From project root
npm start

# Or run in development mode
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

#### 7. Login

Open http://localhost:5173 and login with:
- **Admin:** `admin@rostermate.com` / `admin123`
- **User:** `user@rostermate.com` / `user123`

---

## Database Management

### Available Scripts

All scripts are run from the `server` directory:

```bash
cd server

# Seed database with initial data
npm run seed

# Clean database (removes employees, holidays, rosters)
npm run clean

# Reset database (clean + seed)
npm run clean && npm run seed
```

### Manual Database Operations

```bash
# Connect to MongoDB
mongosh

# Switch to database
use rostermate

# View collections
show collections

# View employees
db.employees.find().pretty()

# View users
db.users.find().pretty()

# Clear specific collection
db.holidays.deleteMany({})

# Drop entire database (⚠️ careful!)
db.dropDatabase()
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] Update all secrets in `.env` (JWT_SECRET, DATABASE_URL, etc.)
- [ ] Set `NODE_ENV=production`
- [ ] Test all features in staging environment
- [ ] Run security audit: `npm audit`
- [ ] Update CORS settings in `server/server.ts` for production domain
- [ ] Review and update rate limiting if needed

### Build for Production

```bash
# Build shared library
cd shared
npm run build

# Build server
cd ../server
npm run build

# Build client
cd ../client
npm run build
```

### Environment Variables for Production

```bash
# server/.env (production)
NODE_ENV=production
PORT=3000
DATABASE_URL=mongodb://your-production-db-url/rostermate
JWT_SECRET=<strong-random-secret>
JWT_REFRESH_SECRET=<another-strong-secret>
SESSION_SECRET=<session-secret>
```

### Deployment Options

#### Option 1: Traditional VPS/Server
1. SSH into server
2. Install Node.js, MongoDB
3. Clone repository
4. Run setup steps above
5. Use PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start npm --name "rostermate" -- start
   pm2 save
   pm2 startup
   ```

#### Option 2: Docker
```dockerfile
# Example Dockerfile (create in project root)
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000 5173
CMD ["npm", "start"]
```

#### Option 3: Cloud Platforms
- **Vercel/Netlify:** Frontend (client/)
- **Heroku/Railway/Render:** Backend (server/)
- **MongoDB Atlas:** Database

---

## Sharing Best Practices

### What to Include

✅ **Include:**
- All source code files
- `package.json` files
- Configuration files (except `.env`)
- `.env.example` file with placeholder values
- Documentation (README, guides)
- This export guide

❌ **Exclude:**
- `node_modules/` directories
- `.env` file (sensitive data)
- `dist/` build folders
- Log files
- `.git/` directory (unless using Git)
- IDE-specific files (.idea, .vscode)

### Create .env.example

```bash
# server/.env.example
PORT=3000
DATABASE_URL=mongodb://localhost:27017/rostermate
JWT_SECRET=change-this-secret
JWT_REFRESH_SECRET=change-this-secret
SESSION_SECRET=change-this-secret
```

### Documentation to Provide

1. **README.md** - Project overview, features, tech stack
2. **PROJECT_EXPORT_GUIDE.md** - This file
3. **server/scripts/README.md** - Database scripts documentation
4. **API_DOCUMENTATION.md** - API endpoints (optional but recommended)

### Sharing via Git

```bash
# Create .gitignore (if not exists)
cat > .gitignore << EOL
# Dependencies
node_modules/
*/node_modules/

# Build outputs
dist/
*/dist/

# Environment files
.env
*.env
!.env.example

# Logs
*.log
npm-debug.log*

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
EOL

# Add and commit
git add .
git commit -m "Prepare project for sharing"
git push
```

---

## Testing After Setup

After a new developer sets up the project, they should test:

1. **Authentication**
   - Login with admin account
   - Login with user account
   - Logout functionality

2. **Employee Management** (Admin only)
   - View employees list
   - Add new employee
   - Edit employee
   - Delete employee
   - Filter by department

3. **Holiday Management**
   - Request holiday (any user)
   - View holidays (any user)
   - Approve/reject holidays (admin only)

4. **Roster Management** (Admin only)
   - View current roster
   - Generate new roster for upcoming week
   - Reassign duty to different employee
   - View roster history

---

## Troubleshooting

### Common Issues

**Issue:** "Cannot connect to database"
**Solution:** Ensure MongoDB is running and DATABASE_URL is correct

**Issue:** "Port 3000 already in use"
**Solution:** Change PORT in .env or kill process using port 3000

**Issue:** "No employees found"
**Solution:** Run `cd server && npm run seed`

**Issue:** "Authentication failed"
**Solution:** Check if users were created during seeding

**Issue:** "CORS errors"
**Solution:** Update CORS configuration in server/server.ts

### Getting Help

If you encounter issues:
1. Check server logs in terminal
2. Check browser console for frontend errors
3. Verify all environment variables are set
4. Ensure MongoDB is accessible
5. Try cleaning and reseeding database

---

## Maintenance Scripts

```bash
# View all available scripts
npm run

# In server directory
cd server

# Seed database
npm run seed

# Clean database
npm run clean

# Run linter
npm run lint

# Build TypeScript
npm run build

# Development mode with hot reload
npm run dev
```

---

## Summary

To share the project:
1. Export using Git (recommended) or create archive
2. Include .env.example with placeholder values
3. Document all setup steps
4. Test in fresh environment before sharing
5. Provide clear instructions for database setup
6. Include this guide and other documentation

For production deployment:
1. Update all secrets
2. Use production MongoDB
3. Build all parts of the application
4. Set NODE_ENV=production
5. Use process manager (PM2, Docker, etc.)
6. Configure proper CORS and security settings

---

**Last Updated:** December 2024
**Version:** 1.0
**Maintainer:** RosterMate Team
