# 🗄️ Database Setup Guide

## 🎯 **Recommended: MongoDB Atlas (Cloud)**

### **Step 1: Create MongoDB Atlas Account**

1. **Go to MongoDB Atlas:**
   - Visit: https://www.mongodb.com/atlas
   - Click "Try Free" or "Sign Up"

2. **Create Your Cluster:**
   - Choose "FREE" tier (M0)
   - Select your preferred cloud provider (AWS/Google Cloud/Azure)
   - Choose a region close to you
   - Click "Create Cluster"

3. **Set Up Database Access:**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Username: `savakv2_user`
   - Password: Create a strong password
   - Role: "Read and write to any database"
   - Click "Add User"

4. **Set Up Network Access:**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Click "Confirm"

5. **Get Your Connection String:**
   - Go to "Database" in the left sidebar
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string

### **Step 2: Update Your Backend**

1. **Edit your `.env` file:**
   ```bash
   cd backend
   # Open .env file and replace DATABASE_URL with your Atlas connection string
   ```

2. **Your `.env` should look like:**
   ```env
   DATABASE_URL="mongodb+srv://savakv2_user:your_password@cluster.mongodb.net/savakv2?retryWrites=true&w=majority"
   NODE_ENV=development
   PORT=5000
   FRONTEND_URL=http://localhost:3000
   ```

### **Step 3: Push Schema to Database**

```bash
cd backend
npm run db:push
```

### **Step 4: Seed the Database**

```bash
npm run db:seed
```

### **Step 5: Test Everything**

```bash
# Start backend
npm start

# In another terminal, start frontend
cd ../frontend
npm start
```

## 🔧 **Alternative: Local MongoDB**

If you prefer to run MongoDB locally:

### **Option A: MongoDB Community Edition**

1. **Download MongoDB:**
   - Go to: https://www.mongodb.com/try/download/community
   - Download for your OS
   - Install following the wizard

2. **Start MongoDB:**
   ```bash
   # Windows
   mongod

   # macOS/Linux
   sudo systemctl start mongod
   ```

3. **Your `.env` stays the same:**
   ```env
   DATABASE_URL="mongodb://localhost:27017/savakv2"
   ```

### **Option B: Docker MongoDB**

1. **Install Docker Desktop**

2. **Run MongoDB Container:**
   ```bash
   docker run --name mongodb -d -p 27017:27017 mongo:latest
   ```

3. **Your `.env` stays the same:**
   ```env
   DATABASE_URL="mongodb://localhost:27017/savakv2"
   ```

## 🚀 **What Happens After Setup**

### **With Real Database:**
- ✅ **Type-safe queries** with Prisma
- ✅ **Automatic migrations**
- ✅ **Prisma Studio** for database management
- ✅ **Real-time data** persistence
- ✅ **User authentication** working
- ✅ **Chat functionality** working

### **Features You'll Get:**
1. **User Registration/Login**
2. **Create/Edit Listings**
3. **Real-time Chat**
4. **Favorites & Comments**
5. **Image Upload**
6. **Search & Filtering**

## 🔍 **Troubleshooting**

### **Common Issues:**

1. **Connection Refused:**
   - Check if MongoDB is running
   - Verify connection string
   - Check network access (Atlas)

2. **Authentication Failed:**
   - Verify username/password
   - Check database user permissions

3. **Schema Push Failed:**
   - Ensure MongoDB is running
   - Check connection string format
   - Try `npm run db:generate` first

## 📊 **MongoDB Atlas Benefits:**

- ✅ **Free tier** (512MB storage)
- ✅ **Automatic backups**
- ✅ **Global distribution**
- ✅ **Built-in security**
- ✅ **No local installation**
- ✅ **Scalable as you grow**

## 🎯 **Next Steps:**

1. **Choose your database option** (Atlas recommended)
2. **Set up the connection**
3. **Push the schema**
4. **Seed the data**
5. **Test the application**

Your application is ready to use a real database! The Prisma setup makes it much easier to work with MongoDB compared to Mongoose.

## 🎉 **Why Prisma > Mongoose:**

- **Type safety** - Catch errors at compile time
- **Auto-completion** - Better developer experience
- **Migrations** - Version control for schema
- **Studio** - Visual database management
- **Performance** - Optimized queries

Choose MongoDB Atlas for the easiest setup! 🚀 