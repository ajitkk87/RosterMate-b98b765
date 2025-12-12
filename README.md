# RosterMate - Employee Duty Roster Management System

A comprehensive web-based application for automatically generating and managing weekly duty rosters for teams across multiple departments.

## 🚀 Features

- **Automatic Roster Generation**: Fair distribution of duties across 30 employees in 3 departments
- **Holiday Management**: Request, approve, and track employee holidays
- **Smart Scheduling**: Accounts for employee availability and rotation fairness
- **Role-Based Access**: Admin and user roles with appropriate permissions
- **Real-time Updates**: Live roster updates and notifications
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## 🏗️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **React Router** for navigation
- **Axios** for API calls

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcrypt** for password hashing

## 📁 Project Structure

```
rostermate/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/           # API client functions
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Page components
│   │   └── types/         # TypeScript types
│   └── package.json
├── server/                # Express backend
│   ├── config/           # Configuration files
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── scripts/          # Database utility scripts
│   └── package.json
├── shared/               # Shared TypeScript types
│   └── package.json
└── package.json          # Root package.json
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 20 or higher
- MongoDB 8.0 or higher
- npm or yarn

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rostermate
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cd server
   cp .env.example .env
   # Edit .env with your settings
   ```

4. **Start MongoDB**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:8.0

   # Or start your local MongoDB instance
   mongod
   ```

   Note: If Docker is not available in your environment (for example inside some devcontainers), start a local `mongod` service or use MongoDB Atlas and set `DATABASE_URL` in `server/.env` to your Atlas URI. A `docker-compose.yml` is included for convenience when Docker is available.

   Example Atlas URI (replace placeholders):

   `mongodb+srv://<username>:<password>@cluster0.mongodb.net/rostermate?retryWrites=true&w=majority`

5. **Seed the database**
   ```bash
   cd server
   npm run seed
   ```

6. **Start the application**
   ```bash
   cd ..
   npm start
   ```

7. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

### Default Login Credentials

After seeding, you can login with:
- **Admin**: `admin@rostermate.com` / `admin123`
- **User**: `user@rostermate.com` / `user123`

## 📝 Available Scripts

### Root Level
```bash
npm start          # Start both frontend and backend
npm run client     # Start only frontend
npm run server     # Start only backend
npm run lint       # Run ESLint
```

### Server Scripts
```bash
cd server
npm run seed       # Seed database with initial data
npm run clean      # Clean database (removes all operational data)
npm run dev        # Start server in development mode
npm run build      # Build TypeScript to JavaScript
```

### Client Scripts
```bash
cd client
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
```

## 🗄️ Database Management

### Seeding the Database

The seed script creates:
- 30 employees (20 Developers, 5 Ops, 5 Platform)
- 2 user accounts (admin and regular user)

```bash
cd server
npm run seed
```

### Cleaning the Database

Removes all operational data while preserving user accounts:

```bash
cd server
npm run clean
```

### Reset Database

To completely reset:

```bash
cd server
npm run clean
npm run seed
```

See `server/scripts/README.md` for detailed documentation.

## 🔐 Authentication

The application uses JWT-based authentication with:
- Access tokens (24-hour expiry)
- Refresh tokens (30-day expiry)
- Secure password hashing with bcrypt
- Role-based access control (Admin/User)

## 🎯 Usage Guide

### For Administrators

1. **Manage Employees**
   - Add new employees with name, email, and department
   - Edit employee information
   - Delete employees
   - View all employees with filtering by department

2. **Generate Rosters**
   - Navigate to Roster page
   - Select a week
   - Click "Generate Roster"
   - System automatically assigns 6 duties:
     - 2x Prod Duty (Developers)
     - 2x Non-Prod Duty (Developers)
     - 1x Ops Duty
     - 1x Platform Duty

3. **Manage Holiday Requests**
   - View all pending holiday requests
   - Approve or reject requests
   - View holiday calendar by department

4. **Reassign Duties**
   - Click on any duty card
   - Select a different available employee
   - Confirm reassignment

### For Employees

1. **View Roster**
   - See current week's duty assignments
   - View your upcoming duties
   - Check duty history

2. **Request Holidays**
   - Select date range
   - Add optional notes
   - Submit for approval
   - Track request status

3. **View Holiday Balance**
   - Check remaining holiday days
   - View past and upcoming holidays
   - See pending requests

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### Employees
- `GET /api/employees` - Get all employees
- `GET /api/employees/:id` - Get employee by ID
- `POST /api/employees` - Create employee (Admin)
- `PUT /api/employees/:id` - Update employee (Admin)
- `DELETE /api/employees/:id` - Delete employee (Admin)

### Holidays
- `GET /api/holidays` - Get all holidays
- `GET /api/holidays/my` - Get current user's holidays
- `POST /api/holidays` - Request holiday
- `PUT /api/holidays/:id/approve` - Approve holiday (Admin)
- `PUT /api/holidays/:id/reject` - Reject holiday (Admin)

### Rosters
- `GET /api/roster?weekStart=YYYY-MM-DD` - Get roster for week
- `POST /api/roster/generate` - Generate new roster (Admin)
- `PUT /api/roster/reassign/:id` - Reassign duty (Admin)
- `GET /api/roster/history` - Get roster history

## 🚢 Deployment

For detailed deployment instructions, see `PROJECT_EXPORT_GUIDE.md`.

### Quick Production Build

```bash
# Build all components
cd shared && npm run build
cd ../server && npm run build
cd ../client && npm run build
```

### Environment Variables

Make sure to update these in production:
- `DATABASE_URL` - Production MongoDB connection string
- `JWT_SECRET` - Strong random secret
- `JWT_REFRESH_SECRET` - Different strong random secret
- `SESSION_SECRET` - Another strong random secret
- `NODE_ENV=production`

## 🧪 Testing

After setting up the project, test these features:

1. ✅ Login with admin credentials
2. ✅ View employees list (should show 30 employees)
3. ✅ Generate a roster for next week
4. ✅ Request a holiday as a user
5. ✅ Approve/reject holiday as admin
6. ✅ Reassign a duty to different employee

## 📚 Documentation

- `PROJECT_EXPORT_GUIDE.md` - Complete guide for exporting and sharing the project
- `server/scripts/README.md` - Database scripts documentation
- Individual file descriptions in `fileDescriptions.json`

## 🤝 Contributing

This is an internal project. For contributions:
1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit for review

## 🛟 Troubleshooting

**Issue: Can't connect to database**
- Ensure MongoDB is running
- Check DATABASE_URL in .env

**Issue: No employees showing**
- Run `cd server && npm run seed`

**Issue: Authentication errors**
- Clear browser localStorage
- Re-login with correct credentials

**Issue: Port already in use**
- Change PORT in server/.env
- Or kill process using the port

## 📄 License

Internal use only - All rights reserved

## 👥 Support

For support and questions, contact the development team.

---

**Version:** 1.0
**Last Updated:** December 2024
