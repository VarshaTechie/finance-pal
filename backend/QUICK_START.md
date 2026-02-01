# Quick Start Guide - Finance Pal Backend

## Prerequisites
- Node.js installed (v14+)
- MongoDB Atlas account (free tier)

## Step 1: MongoDB Atlas Setup (5 minutes)

1. **Create Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for free

2. **Create Cluster**
   - Click "Build a Database"
   - Choose FREE tier (M0)
   - Select a cloud provider and region
   - Click "Create Cluster"

3. **Create Database User**
   - Go to "Database Access" (left sidebar)
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Username: `financepal`
   - Password: Generate a secure password (save it!)
   - User Privileges: "Atlas admin"
   - Click "Add User"

4. **Whitelist IP Address**
   - Go to "Network Access" (left sidebar)
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" (left sidebar)
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - It looks like: `mongodb+srv://financepal:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

## Step 2: Configure Backend (2 minutes)

1. **Navigate to backend folder**
   ```bash
   cd backend
   ```

2. **Update .env file**
   - Open `backend/.env` in your editor
   - Replace the `MONGODB_URI` line with your connection string
   - Replace `<password>` with your actual password
   - Add database name: change `/?retryWrites` to `/finance-pal?retryWrites`

   Example:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb+srv://financepal:YourPassword123@cluster0.xxxxx.mongodb.net/finance-pal?retryWrites=true&w=majority
   NEWS_API_KEY=optional
   ```

## Step 3: Start the Server (1 minute)

```bash
npm run dev
```

**Expected output:**
```
✅ MongoDB Connected: cluster0-xxxxx.mongodb.net
🚀 Server running on port 5000
📍 Environment: development
🔗 Health check: http://localhost:5000/health
```

## Step 4: Test the API (2 minutes)

Open a new terminal and run:

```bash
curl http://localhost:5000/health
```

**Expected response:**
```json
{
  "success": true,
  "message": "Finance Pal API is running",
  "timestamp": "2026-01-30T..."
}
```

**Create a test user:**
```bash
curl -X POST http://localhost:5000/api/income -H "Content-Type: application/json" -d "{\"name\":\"Test User\",\"email\":\"test@example.com\",\"monthlyIncome\":50000}"
```

Save the `_id` from the response - you'll need it!

## Step 5: Test All Endpoints

See [API_TESTING_GUIDE.md](file:///e:/finance-pal/backend/API_TESTING_GUIDE.md) for complete testing instructions.

## Troubleshooting

### "MongoServerError: bad auth"
- Check your password in the connection string
- Ensure database user is created in MongoDB Atlas

### "ECONNREFUSED"
- Check if MongoDB cluster is running
- Verify IP is whitelisted (0.0.0.0/0 for development)

### "Cannot find module"
- Run `npm install` in the backend directory

### Port already in use
- Change PORT in `.env` to a different number (e.g., 5001)

## Next Steps

1. ✅ Backend is running
2. 📱 Connect your React frontend
3. 🧪 Test all API endpoints
4. 🚀 Build your features!

## File Structure Reference

```
backend/
├── models/          → Database schemas
├── controllers/     → Request handlers
├── routes/          → API endpoints
├── services/        → Business logic
├── middleware/      → Validation & errors
├── utils/           → Helper functions
├── config/          → Database connection
└── server.js        → Main entry point
```

## API Endpoints Summary

- `GET /health` - Health check
- `POST /api/income` - Set income
- `GET /api/income/:userId` - Get income
- `POST /api/expenses` - Add expense
- `GET /api/expenses/:userId` - Get expenses
- `GET /api/summary/:userId` - Financial summary
- `GET /api/recommendations/:userId` - Savings tips
- `GET /api/news` - Financial news

## Support

- 📖 Full documentation: [README.md](file:///e:/finance-pal/backend/README.md)
- 🧪 Testing guide: [API_TESTING_GUIDE.md](file:///e:/finance-pal/backend/API_TESTING_GUIDE.md)
- 📝 Implementation details: See walkthrough artifact

---

**You're all set! 🎉**
