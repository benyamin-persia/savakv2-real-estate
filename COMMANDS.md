# 🚀 Available Commands

## 🎯 Quick Start Commands

### 1. Update MongoDB Connection String
```bash
node update-mongodb.js "mongodb+srv://your-username:your-password@your-cluster.mongodb.net/savakv2"
```

### 2. Start Application (Automatic)
```bash
node start-application.js
```

### 3. Start Application (Manual)
```bash
# Option A: Use batch files
start-all.bat

# Option B: Manual commands
cd backend && npm start
cd frontend && npm start
```

## 🔧 Setup Commands

### Fix All Issues Automatically
```bash
node fix-all-automatically.js
```

### Update OAuth Credentials
```bash
node update-oauth.js
```

### Generate Secure Secrets
```bash
node generate-secrets.js
```

### Setup Database Indexes
```bash
cd backend
node setup-database.js
```

## 📋 Step-by-Step Process

### Step 1: Fix All Issues
```bash
node fix-all-automatically.js
```

### Step 2: Update MongoDB Connection
```bash
# Get your connection string from MongoDB Atlas, then:
node update-mongodb.js "your-actual-connection-string"
```

### Step 3: Start Application
```bash
node start-application.js
```

## 🐛 Troubleshooting Commands

### Check MongoDB Connection
```bash
node setup-mongodb.js
```

### Check Current Configuration
```bash
# View backend .env
cat backend/.env

# View frontend .env  
cat frontend/.env
```

### Restart Application
```bash
# Stop current processes (Ctrl+C), then:
node start-application.js
```

## 📁 File Locations

- **Backend**: `backend/`
- **Frontend**: `frontend/`
- **Environment Files**: `backend/.env`, `frontend/.env`
- **Startup Scripts**: `start-all.bat`, `start-backend.bat`, `start-frontend.bat`

## 🎯 Expected Results

After running the commands:
1. ✅ MongoDB connection working
2. ✅ Backend server running on port 5000
3. ✅ Frontend server running on port 3000
4. ✅ Google OAuth working (after configuring redirect URIs)
5. ✅ All authentication features functional

## 🚀 One-Command Solution

For the fastest setup:
```bash
# 1. Fix all issues
node fix-all-automatically.js

# 2. Update MongoDB connection (replace with your actual string)
node update-mongodb.js "mongodb+srv://username:password@cluster.mongodb.net/savakv2"

# 3. Start application
node start-application.js
```

Your application will be fully functional! 🎉 