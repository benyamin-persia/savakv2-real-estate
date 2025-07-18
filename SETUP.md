# Project Setup Guide

## Prerequisites

### 1. Install MongoDB
You need to install MongoDB Community Edition:

**Option A: Download from MongoDB website**
1. Go to https://www.mongodb.com/try/download/community
2. Download MongoDB Community Server for Windows
3. Run the installer and follow the setup wizard
4. Make sure to install MongoDB as a service

**Option B: Using Chocolatey (if you have it installed)**
```powershell
choco install mongodb
```

**Option C: Using MongoDB Atlas (Cloud Database)**
1. Go to https://www.mongodb.com/atlas
2. Create a free account
3. Create a new cluster
4. Get your connection string

### 2. Install Node.js (if not already installed)
Download from https://nodejs.org/ (LTS version recommended)

## Environment Setup

### 1. Create Environment Files

**Backend (.env)**
Create `backend/.env`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/savakv2
SESSION_SECRET=your-super-secret-session-key-change-this
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
JWT_SECRET=your-jwt-secret-key-change-this
```

**Frontend (.env)**
Create `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_MAPBOX_TOKEN=your-mapbox-token
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

## Running the Application

### 1. Start MongoDB
If you installed MongoDB as a service, it should be running automatically.
To check if MongoDB is running:
```bash
# Check if MongoDB service is running
sc query MongoDB

# Or start it manually
net start MongoDB
```

### 2. Start the Application
From the root directory:
```bash
npm run dev
```

This will start both frontend (port 3000) and backend (port 5000).

## Troubleshooting

### MongoDB Connection Issues
1. Make sure MongoDB is installed and running
2. Check if the MongoDB service is running: `sc query MongoDB`
3. If using MongoDB Atlas, update the MONGODB_URI in backend/.env
4. Test connection: `mongosh` or `mongo` (older versions)

### Frontend Issues
1. Make sure react-scripts is installed: `cd frontend && npm install react-scripts`
2. Clear npm cache: `npm cache clean --force`
3. Delete node_modules and reinstall: `rm -rf node_modules && npm install`

### Backend Issues
1. Check if all dependencies are installed: `cd backend && npm install`
2. Verify .env file exists and has correct values
3. Check if port 5000 is available

## Development Workflow

1. **Start MongoDB** (if not running as service)
2. **Start the application**: `npm run dev`
3. **Frontend**: http://localhost:3000
4. **Backend API**: http://localhost:5000/api
5. **Health Check**: http://localhost:5000/api/health

## Next Steps

1. Set up Google OAuth credentials
2. Set up Microsoft OAuth credentials  
3. Get a Mapbox token for the interactive map
4. Configure environment variables
5. Test the application

## Useful Commands

```bash
# Start development servers
npm run dev

# Start only backend
npm run dev:backend

# Start only frontend  
npm run dev:frontend

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint
``` 