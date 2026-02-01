# Finance Pal Backend - API Testing Guide

This guide provides examples for testing all API endpoints using cURL, Postman, or JavaScript fetch.

## Setup

1. Ensure the backend server is running:
```bash
cd backend
npm run dev
```

2. Server should be running at: `http://localhost:5000`

## Test Endpoints

### 1. Health Check

**cURL:**
```bash
curl http://localhost:5000/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Finance Pal API is running",
  "timestamp": "2026-01-30T16:22:37.000Z"
}
```

---

### 2. Create User & Set Income

**cURL:**
```bash
curl -X POST http://localhost:5000/api/income \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"John Doe\",\"email\":\"john@example.com\",\"monthlyIncome\":50000}"
```

**JavaScript (fetch):**
```javascript
const response = await fetch('http://localhost:5000/api/income', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    monthlyIncome: 50000
  })
});
const data = await response.json();
console.log(data);
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Income updated successfully",
  "data": {
    "_id": "65b8f9e7c1234567890abcde",
    "name": "John Doe",
    "email": "john@example.com",
    "monthlyIncome": 50000,
    "createdAt": "2026-01-30T16:22:37.000Z"
  }
}
```

**Save the `_id` value - you'll need it as `userId` for other requests!**

---

### 3. Get User Income

Replace `USER_ID` with the actual ID from step 2.

**cURL:**
```bash
curl http://localhost:5000/api/income/USER_ID
```

---

### 4. Add Expenses

**cURL:**
```bash
curl -X POST http://localhost:5000/api/expenses \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"USER_ID\",\"amount\":1500,\"category\":\"Food & Dining\",\"description\":\"Groceries\"}"
```

Add multiple expenses for better testing:

```bash
# Transportation
curl -X POST http://localhost:5000/api/expenses \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"USER_ID\",\"amount\":2000,\"category\":\"Transportation\",\"description\":\"Fuel\"}"

# Entertainment
curl -X POST http://localhost:5000/api/expenses \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"USER_ID\",\"amount\":800,\"category\":\"Entertainment\",\"description\":\"Movie tickets\"}"

# Shopping
curl -X POST http://localhost:5000/api/expenses \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"USER_ID\",\"amount\":3000,\"category\":\"Shopping\",\"description\":\"Clothes\"}"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Expense added successfully",
  "data": {
    "_id": "65b8f9e7c1234567890abcdf",
    "userId": "65b8f9e7c1234567890abcde",
    "amount": 1500,
    "category": "Food & Dining",
    "description": "Groceries",
    "date": "2026-01-30T16:22:37.000Z",
    "createdAt": "2026-01-30T16:22:37.000Z"
  }
}
```

---

### 5. Get All Expenses

**cURL:**
```bash
curl http://localhost:5000/api/expenses/USER_ID
```

**With filters (date range):**
```bash
curl "http://localhost:5000/api/expenses/USER_ID?startDate=2026-01-01&endDate=2026-01-31"
```

**With category filter:**
```bash
curl "http://localhost:5000/api/expenses/USER_ID?category=Food%20%26%20Dining"
```

---

### 6. Get Financial Summary

**cURL:**
```bash
curl http://localhost:5000/api/summary/USER_ID
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "monthlyIncome": 50000,
    "totalExpenses": 7300,
    "remainingBalance": 42700,
    "savingsRate": 85.4,
    "categoryBreakdown": {
      "Food & Dining": 1500,
      "Transportation": 2000,
      "Entertainment": 800,
      "Shopping": 3000
    },
    "expenseCount": 4,
    "period": {
      "start": "2026-01-01T00:00:00.000Z",
      "end": "2026-01-31T23:59:59.999Z"
    }
  }
}
```

---

### 7. Get Savings Recommendations

**cURL:**
```bash
curl http://localhost:5000/api/recommendations/USER_ID
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "userId": "65b8f9e7c1234567890abcde",
    "recommendedSavings": 0,
    "totalExpenses": 7300,
    "expenseToIncomeRatio": 14.6,
    "categorySuggestions": {
      "Housing": {
        "currentSpending": 0,
        "recommendedSpending": 15000,
        "potentialSavings": 0,
        "percentageOfIncome": 0,
        "status": "good"
      },
      "Food & Dining": {
        "currentSpending": 1500,
        "recommendedSpending": 7500,
        "potentialSavings": 0,
        "percentageOfIncome": 3,
        "status": "good"
      },
      "Transportation": {
        "currentSpending": 2000,
        "recommendedSpending": 7500,
        "potentialSavings": 0,
        "percentageOfIncome": 4,
        "status": "good"
      }
    },
    "generatedAt": "2026-01-30T16:22:37.000Z"
  }
}
```

---

### 8. Get Financial News

**cURL:**
```bash
curl http://localhost:5000/api/news
```

**Expected Response:**
```json
{
  "success": true,
  "articles": [
    {
      "id": 1,
      "title": "Stock Market Reaches New Heights Amid Economic Recovery",
      "description": "Major indices show strong performance...",
      "source": "Financial Times",
      "publishedAt": "2026-01-30T14:22:37.000Z",
      "url": "https://example.com/news/1",
      "category": "Markets"
    }
  ],
  "totalResults": 5
}
```

---

### 9. Delete an Expense

**cURL:**
```bash
curl -X DELETE http://localhost:5000/api/expenses/EXPENSE_ID
```

---

## Postman Collection

You can import these endpoints into Postman:

1. Create a new collection called "Finance Pal API"
2. Add a variable `baseUrl` = `http://localhost:5000`
3. Add a variable `userId` = (your user ID)
4. Create requests for each endpoint above

## Testing with Frontend

Update your React app's API configuration:

```typescript
// src/config/api.ts
export const API_BASE_URL = 'http://localhost:5000/api';

// Example usage
export const incomeApi = {
  create: (data) => fetch(`${API_BASE_URL}/income`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  get: (userId) => fetch(`${API_BASE_URL}/income/${userId}`)
};
```

## Common Issues

### CORS Error
- Ensure backend is running
- Check CORS is enabled in `server.js`
- Verify frontend is making requests to correct URL

### MongoDB Connection Error
- Check `.env` file has correct `MONGODB_URI`
- Verify MongoDB Atlas cluster is running
- Check IP whitelist in MongoDB Atlas (allow 0.0.0.0/0 for development)

### Validation Errors
- Ensure all required fields are provided
- Check data types match schema requirements
- Verify category names match predefined list

## Next Steps

1. Test all endpoints manually
2. Integrate with React frontend
3. Add real MongoDB Atlas connection string
4. (Optional) Replace mock news with real API
