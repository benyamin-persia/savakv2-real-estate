# SavakV2 - Real Estate Platform

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Google OAuth credentials (optional)
- Microsoft OAuth credentials (optional)

### Setup Instructions

1. **Environment Configuration**
   - Update `backend/.env` with your MongoDB connection string
   - Update `frontend/.env` with your API URL
   - Add OAuth credentials if using social login

2. **Database Setup**
   ```bash
   cd backend
   node setup-database.js
   ```

3. **Start the Application**
   - Run `start-all.bat` to start both servers
   - Or run `start-backend.bat` and `start-frontend.bat` separately

### Environment Variables

#### Backend (.env)
```
DATABASE_URL="your-mongodb-connection-string"
MONGODB_URI="your-mongodb-connection-string"
SESSION_SECRET="your-session-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

#### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000
```

### Features
- User authentication (local + OAuth)
- Real estate listings
- Interactive maps
- Real-time chat
- User profiles
- Search and filtering

### Troubleshooting

#### Database Connection Issues
1. Check your MongoDB connection string
2. Ensure your IP is whitelisted in MongoDB Atlas
3. Run `node setup-database.js` to fix indexes

#### OAuth Issues
1. Verify your OAuth credentials in .env
2. Check redirect URIs in OAuth provider settings
3. Ensure CORS is properly configured

#### Port Issues
- Backend runs on port 5000
- Frontend runs on port 3000
- Check if ports are available

### Development
- Backend: Express.js, MongoDB, Prisma
- Frontend: React, Leaflet, Socket.io
- Authentication: Passport.js, Session-based
