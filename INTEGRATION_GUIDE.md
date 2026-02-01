# Frontend-Backend Integration Guide

## ✅ What Just Happened

I've created 3 files in your React app to connect to the Finance Pal backend:

1. **`src/lib/api.ts`** - Complete API client with TypeScript types
2. **`src/lib/api-examples.tsx`** - Example components showing how to use the API
3. **`src/lib/hooks.ts`** - Custom React hooks for easier integration

---

## 🚀 Quick Start

### Step 1: Use the Hooks (Easiest Method)

The custom hooks make integration super simple:

```tsx
import { useUser, useSummary, useExpenses } from '@/lib/hooks';

function Dashboard() {
  const { userId } = useUser();
  const { summary, loading } = useSummary(userId);
  const { expenses, addExpense } = useExpenses(userId);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Financial Dashboard</h1>
      <p>Balance: ₹{summary?.remainingBalance.toLocaleString()}</p>
      <p>Total Expenses: ₹{summary?.totalExpenses.toLocaleString()}</p>
      <p>Savings Rate: {summary?.savingsRate}%</p>
    </div>
  );
}
```

### Step 2: Add Expenses

```tsx
import { useUser, useExpenses } from '@/lib/hooks';

function AddExpense() {
  const { userId } = useUser();
  const { addExpense } = useExpenses(userId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await addExpense({
      amount: 500,
      category: 'Food & Dining',
      description: 'Groceries'
    });
    
    // Done! The expenses list will auto-refresh
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Step 3: Get Recommendations

```tsx
import { useUser, useRecommendations } from '@/lib/hooks';

function Recommendations() {
  const { userId } = useUser();
  const { recommendations, loading, generate } = useRecommendations(userId);

  return (
    <div>
      <button onClick={generate} disabled={loading}>
        Get Recommendations
      </button>
      
      {recommendations && (
        <div>
          <p>You can save: ₹{recommendations.recommendedSavings}</p>
        </div>
      )}
    </div>
  );
}
```

---

## 📚 Available Hooks

### `useUser()`
```tsx
const { userId, saveUserId, clearUserId } = useUser();
```
- Manages user ID (stores in localStorage)
- Returns current userId

### `useIncome(userId)`
```tsx
const { income, loading, error, refetch } = useIncome(userId);
```
- Fetches user's income information
- Auto-loads when component mounts

### `useExpenses(userId, filters?)`
```tsx
const { 
  expenses, 
  loading, 
  error, 
  refetch,
  addExpense,
  deleteExpense 
} = useExpenses(userId);
```
- Fetches and manages expenses
- Built-in add/delete functions
- Auto-refreshes after changes

### `useSummary(userId, filters?)`
```tsx
const { summary, loading, error, refetch } = useSummary(userId);
```
- Gets financial summary
- Income vs expenses breakdown
- Category-wise spending

### `useRecommendations(userId)`
```tsx
const { recommendations, loading, error, generate } = useRecommendations(userId);
```
- ML-based savings recommendations
- Call `generate()` to fetch new recommendations

### `useNews()`
```tsx
const { news, loading, error, refetch } = useNews();
```
- Fetches financial news
- Auto-loads latest articles

---

## 🔧 Direct API Usage (Alternative)

If you prefer not to use hooks, use the API client directly:

```tsx
import { api } from '@/lib/api';

// Get summary
const result = await api.summary.get(userId);
console.log(result.data);

// Add expense
await api.expenses.add({
  userId,
  amount: 1000,
  category: 'Transportation'
});

// Get recommendations
const recs = await api.recommendations.get(userId);
```

---

## 🎯 Integration Steps for Your App

### 1. Setup User Flow

In your onboarding/setup component:

```tsx
import { api } from '@/lib/api';
import { useUser } from '@/lib/hooks';

function Setup() {
  const { saveUserId } = useUser();

  const handleSetup = async (formData) => {
    const result = await api.income.createOrUpdate({
      name: formData.name,
      email: formData.email,
      monthlyIncome: formData.income
    });

    if (result.success && result.data) {
      saveUserId(result.data._id); // Save for future use
      // Navigate to dashboard
    }
  };

  return <form onSubmit={handleSetup}>...</form>;
}
```

### 2. Update Your Dashboard

Replace any mock data with real API calls:

```tsx
import { useUser, useSummary } from '@/lib/hooks';

function Dashboard() {
  const { userId } = useUser();
  const { summary, loading } = useSummary(userId);

  // Your existing UI with real data
  return <YourDashboardUI summary={summary} />;
}
```

### 3. Update Expense Forms

```tsx
import { useUser, useExpenses } from '@/lib/hooks';

function ExpenseForm() {
  const { userId } = useUser();
  const { addExpense } = useExpenses(userId);

  const handleSubmit = async (data) => {
    await addExpense(data);
    // Expense list auto-refreshes!
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

## 🎨 Example Components

Check `src/lib/api-examples.tsx` for complete working examples:
- IncomeSetupExample
- AddExpenseExample
- ExpensesListExample
- SummaryExample
- RecommendationsExample
- NewsExample

You can copy these patterns into your actual components!

---

## 🧪 Testing

1. **Test API connection:**
```tsx
import { api } from '@/lib/api';

// In your component
useEffect(() => {
  api.health.check().then(console.log);
}, []);
```

2. **Test creating user:**
```tsx
const result = await api.income.createOrUpdate({
  name: 'Test User',
  email: 'test@example.com',
  monthlyIncome: 50000
});
console.log('User ID:', result.data?._id);
```

---

## 🔐 Environment Variable (Optional)

Create `.env` in your React app root:

```env
VITE_API_URL=http://localhost:5000/api
```

The API client will automatically use this!

---

## ✅ You're Ready!

Your React app can now:
- ✅ Create/update users and income
- ✅ Add, view, delete expenses
- ✅ Get financial summaries
- ✅ Generate ML recommendations
- ✅ Fetch financial news

**Backend is running at:** `http://localhost:5000`
**Frontend connects to:** `http://localhost:5000/api`

Start using the hooks in your components! 🎉
