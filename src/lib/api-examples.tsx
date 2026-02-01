/**
 * Example: How to use the Finance Pal API in React Components
 * 
 * This file shows practical examples of using the API client
 * Copy these patterns into your actual components
 */

import { useState, useEffect } from 'react';
import { api, EXPENSE_CATEGORIES } from '@/lib/api';

/**
 * Example 1: Set User Income
 */
export function IncomeSetupExample() {
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    const handleSetIncome = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData(e.currentTarget);

            const result = await api.income.createOrUpdate({
                name: formData.get('name') as string,
                email: formData.get('email') as string,
                monthlyIncome: Number(formData.get('income')),
            });

            if (result.success && result.data) {
                setUserId(result.data._id);
                console.log('User created/updated:', result.data);
                // Store userId in localStorage or context
                localStorage.setItem('userId', result.data._id);
            }
        } catch (error) {
            console.error('Error setting income:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSetIncome}>
            <input name="name" placeholder="Your Name" required />
            <input name="email" type="email" placeholder="Email" required />
            <input name="income" type="number" placeholder="Monthly Income" required />
            <button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Set Income'}
            </button>
            {userId && <p>User ID: {userId}</p>}
        </form>
    );
}

/**
 * Example 2: Add Expense
 */
export function AddExpenseExample() {
    const [loading, setLoading] = useState(false);
    const userId = localStorage.getItem('userId') || '';

    const handleAddExpense = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData(e.currentTarget);

            const result = await api.expenses.add({
                userId,
                amount: Number(formData.get('amount')),
                category: formData.get('category') as string,
                description: formData.get('description') as string,
            });

            if (result.success) {
                console.log('Expense added:', result.data);
                // Refresh your expense list here
                e.currentTarget.reset();
            }
        } catch (error) {
            console.error('Error adding expense:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleAddExpense}>
            <input name="amount" type="number" placeholder="Amount" required />
            <select name="category" required>
                <option value="">Select Category</option>
                {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                ))}
            </select>
            <input name="description" placeholder="Description" />
            <button type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add Expense'}
            </button>
        </form>
    );
}

/**
 * Example 3: Display Expenses List
 */
export function ExpensesListExample() {
    const [expenses, setExpenses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const userId = localStorage.getItem('userId') || '';

    useEffect(() => {
        loadExpenses();
    }, []);

    const loadExpenses = async () => {
        try {
            const result = await api.expenses.getAll(userId);
            if (result.success && result.data) {
                setExpenses(result.data);
            }
        } catch (error) {
            console.error('Error loading expenses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (expenseId: string) => {
        try {
            const result = await api.expenses.delete(expenseId);
            if (result.success) {
                // Refresh the list
                loadExpenses();
            }
        } catch (error) {
            console.error('Error deleting expense:', error);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h2>Your Expenses</h2>
            {expenses.length === 0 ? (
                <p>No expenses yet</p>
            ) : (
                <ul>
                    {expenses.map((expense) => (
                        <li key={expense._id}>
                            <strong>{expense.category}</strong>: ₹{expense.amount}
                            {expense.description && ` - ${expense.description}`}
                            <button onClick={() => handleDelete(expense._id)}>Delete</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

/**
 * Example 4: Display Financial Summary
 */
export function SummaryExample() {
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const userId = localStorage.getItem('userId') || '';

    useEffect(() => {
        loadSummary();
    }, []);

    const loadSummary = async () => {
        try {
            const result = await api.summary.get(userId);
            if (result.success && result.data) {
                setSummary(result.data);
            }
        } catch (error) {
            console.error('Error loading summary:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading summary...</div>;
    if (!summary) return <div>No data available</div>;

    return (
        <div>
            <h2>Financial Summary</h2>
            <p>Monthly Income: ₹{summary.monthlyIncome.toLocaleString()}</p>
            <p>Total Expenses: ₹{summary.totalExpenses.toLocaleString()}</p>
            <p>Remaining Balance: ₹{summary.remainingBalance.toLocaleString()}</p>
            <p>Savings Rate: {summary.savingsRate}%</p>

            <h3>Category Breakdown</h3>
            <ul>
                {Object.entries(summary.categoryBreakdown || {}).map(([category, amount]) => (
                    <li key={category}>
                        {category}: ₹{(amount as number).toLocaleString()}
                    </li>
                ))}
            </ul>
        </div>
    );
}

/**
 * Example 5: Get Savings Recommendations
 */
export function RecommendationsExample() {
    const [recommendations, setRecommendations] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const userId = localStorage.getItem('userId') || '';

    const loadRecommendations = async () => {
        setLoading(true);
        try {
            const result = await api.recommendations.get(userId);
            if (result.success && result.data) {
                setRecommendations(result.data);
            }
        } catch (error) {
            console.error('Error loading recommendations:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Savings Recommendations</h2>
            <button onClick={loadRecommendations} disabled={loading}>
                {loading ? 'Generating...' : 'Get Recommendations'}
            </button>

            {recommendations && (
                <div>
                    <p>Recommended Savings: ₹{recommendations.recommendedSavings.toLocaleString()}</p>
                    <p>Expense to Income Ratio: {recommendations.expenseToIncomeRatio}%</p>

                    <h3>Category Suggestions</h3>
                    {Object.entries(recommendations.categorySuggestions || {}).map(([category, data]: [string, any]) => (
                        <div key={category}>
                            <strong>{category}</strong>:
                            {data.status === 'overspending' ? (
                                <span style={{ color: 'red' }}>
                                    Overspending by ₹{data.potentialSavings.toLocaleString()}
                                </span>
                            ) : (
                                <span style={{ color: 'green' }}>Good!</span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

/**
 * Example 6: Display Financial News
 */
export function NewsExample() {
    const [news, setNews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNews();
    }, []);

    const loadNews = async () => {
        try {
            const result = await api.news.get();
            if (result.success && result.data) {
                setNews(result.data.articles || []);
            }
        } catch (error) {
            console.error('Error loading news:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading news...</div>;

    return (
        <div>
            <h2>Financial News</h2>
            {news.map((article) => (
                <div key={article.id}>
                    <h3>{article.title}</h3>
                    <p>{article.description}</p>
                    <small>{article.source} - {new Date(article.publishedAt).toLocaleDateString()}</small>
                </div>
            ))}
        </div>
    );
}
