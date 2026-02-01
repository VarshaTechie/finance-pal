# Finance Pal Backend API

Complete Node.js + Express backend for the Finance Pal personal finance management application.

## 🚀 Features

- **User Income Management**: Track monthly income
- **Expense Tracking**: Record and categorize expenses
- **Financial Summary**: Get comprehensive income vs expenses overview
- **ML-Inspired Recommendations**: Smart savings suggestions based on spending patterns
- **Financial News**: Access to financial news feed
- **MongoDB Integration**: Persistent data storage with Mongoose ODM
- **RESTful API**: Clean, well-structured API endpoints
- **Error Handling**: Comprehensive validation and error responses
- **CORS Enabled**: Ready for frontend integration

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account (free tier) or local MongoDB installation
- npm or yarn

## 🛠️ Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update the `MONGODB_URI` with your MongoDB connection string

```bash
cp .env.example .env
```

## 🔧 Configuration

Edit the `.env` file with your settings:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_atlas_connection_string
NEWS_API_KEY=optional_news_api_key
```

### Getting MongoDB Atlas Connection String:

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account and cluster
3. Click "Connect" → "Connect your application"
4. Copy the connection string
5. Replace `<username>`, `<password>`, and database name in the connection string

## 🚀 Running the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## 📡 API Endpoints

### Health Check
- **GET** `/health` - Check if API is running

### Income Management
- **POST** `/api/income` - Create or update monthly income
  ```json
  {
    "userId": "optional_existing_user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "monthlyIncome": 50000
  }
  ```
- **GET** `/api/income/:userId` - Get user's income information

### Expense Management
- **POST** `/api/expenses` - Add new expense
  ```json
  {
    "userId": "user_id",
    "amount": 500,
    "category": "Food & Dining",
    "date": "2026-01-30",
    "description": "Grocery shopping"
  }
  ```
- **GET** `/api/expenses/:userId` - Get user's expenses
  - Query params: `startDate`, `endDate`, `category`
- **DELETE** `/api/expenses/:expenseId` - Delete an expense

### Financial Summary
- **GET** `/api/summary/:userId` - Get financial overview
  - Query params: `startDate`, `endDate` (defaults to current month)
  - Returns: income, expenses, balance, category breakdown, savings rate

### Recommendations
- **GET** `/api/recommendations/:userId` - Get ML-based savings recommendations
  - Analyzes spending patterns
  - Compares against recommended budgets
  - Provides category-wise suggestions

### Financial News
- **GET** `/api/news` - Get financial news feed
  - Currently returns mock data
  - Ready for real API integration

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   ├── incomeController.js
│   ├── expenseController.js
│   ├── summaryController.js
│   ├── recommendationController.js
│   └── newsController.js
├── middleware/
│   ├── errorHandler.js      # Centralized error handling
│   └── validateRequest.js   # Request validation
├── models/
│   ├── User.js              # User schema
│   ├── Expense.js           # Expense schema
│   └── Recommendation.js    # Recommendation schema
├── routes/
│   ├── income.js
│   ├── expenses.js
│   ├── summary.js
│   ├── recommendations.js
│   └── news.js
├── services/
│   ├── recommendationService.js  # ML-inspired logic
│   └── newsService.js            # News fetching
├── utils/
│   ├── constants.js         # App constants
│   └── helpers.js           # Utility functions
├── .env                     # Environment variables
├── .env.example             # Environment template
├── .gitignore
├── package.json
└── server.js                # Entry point
```

## 🎯 Expense Categories

- Food & Dining
- Transportation
- Housing
- Utilities
- Healthcare
- Entertainment
- Shopping
- Education
- Personal Care
- Insurance
- Savings & Investments
- Other

## 🧠 Recommendation Algorithm

The recommendation service uses an ML-inspired pattern-based approach:

1. **Data Collection**: Fetches user's income and current month expenses
2. **Category Analysis**: Aggregates spending by category
3. **Budget Comparison**: Compares against industry-standard percentages (50/30/20 rule)
4. **Overspending Detection**: Identifies categories exceeding recommendations
5. **Savings Calculation**: Generates potential savings per category
6. **Actionable Insights**: Provides specific reduction targets

## 🔒 Security Features

- Input sanitization
- Request validation
- MongoDB injection prevention
- CORS configuration
- Environment variable protection
- Error message sanitization

## 🧪 Testing

Test the API using:
- **Postman**: Import endpoints and test manually
- **cURL**: Command-line testing
- **Frontend Integration**: Connect with React app

Example cURL request:
```bash
curl http://localhost:5000/health
```

## 🔄 Integration with Frontend

Update your React frontend to use this backend:

```javascript
const API_BASE_URL = 'http://localhost:5000/api';

// Example: Fetch expenses
const response = await fetch(`${API_BASE_URL}/expenses/${userId}`);
const data = await response.json();
```

## 📝 Future Enhancements

- [ ] Real financial news API integration
- [ ] User authentication (JWT)
- [ ] Advanced ML model for predictions
- [ ] Data export functionality
- [ ] Budget goal setting
- [ ] Recurring expense tracking
- [ ] Multi-currency support

## 🤝 Contributing

This is an academic project. Feel free to extend and improve!

## 📄 License

ISC

## 👨‍💻 Author

Created for academic evaluation and learning purposes.
