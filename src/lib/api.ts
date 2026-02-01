/**
 * Finance Pal API Client
 * Connects React frontend to Node.js/Express backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    errors?: string[];
}

interface User {
    _id: string;
    name: string;
    email: string;
    monthlyIncome: number;
    createdAt: string;
}

interface Expense {
    _id: string;
    userId: string;
    amount: number;
    category: string;
    date: string;
    description?: string;
    createdAt: string;
}

interface Summary {
    monthlyIncome: number;
    totalExpenses: number;
    remainingBalance: number;
    savingsRate: number;
    categoryBreakdown: Record<string, number>;
    expenseCount: number;
    period: {
        start: string;
        end: string;
    };
}

interface Recommendation {
    userId: string;
    recommendedSavings: number;
    totalExpenses: number;
    expenseToIncomeRatio: number;
    categorySuggestions: Record<string, {
        currentSpending: number;
        recommendedSpending: number;
        potentialSavings: number;
        percentageOfIncome: number;
        status: 'good' | 'overspending';
    }>;
    generatedAt: string;
}

interface NewsArticle {
    id: number;
    title: string;
    description: string;
    source: string;
    publishedAt: string;
    url: string;
    category: string;
}

/**
 * API client for Finance Pal backend
 */
export const api = {
    /**
     * Income Management
     */
    income: {
        /**
         * Create or update user income
         */
        createOrUpdate: async (data: {
            userId?: string;
            name: string;
            email: string;
            monthlyIncome: number;
        }): Promise<ApiResponse<User>> => {
            const response = await fetch(`${API_BASE_URL}/income`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            return response.json();
        },

        /**
         * Get user income information
         */
        get: async (userId: string): Promise<ApiResponse<User>> => {
            const response = await fetch(`${API_BASE_URL}/income/${userId}`);
            return response.json();
        },
    },

    /**
     * Expense Management
     */
    expenses: {
        /**
         * Add a new expense
         */
        add: async (data: {
            userId: string;
            amount: number;
            category: string;
            date?: string;
            description?: string;
        }): Promise<ApiResponse<Expense>> => {
            const response = await fetch(`${API_BASE_URL}/expenses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            return response.json();
        },

        /**
         * Get user expenses with optional filters
         */
        getAll: async (
            userId: string,
            filters?: {
                startDate?: string;
                endDate?: string;
                category?: string;
            }
        ): Promise<ApiResponse<Expense[]>> => {
            const params = new URLSearchParams();
            if (filters?.startDate) params.append('startDate', filters.startDate);
            if (filters?.endDate) params.append('endDate', filters.endDate);
            if (filters?.category) params.append('category', filters.category);

            const queryString = params.toString();
            const url = `${API_BASE_URL}/expenses/${userId}${queryString ? `?${queryString}` : ''}`;

            const response = await fetch(url);
            return response.json();
        },

        /**
         * Delete an expense
         */
        delete: async (expenseId: string): Promise<ApiResponse> => {
            const response = await fetch(`${API_BASE_URL}/expenses/${expenseId}`, {
                method: 'DELETE',
            });
            return response.json();
        },
    },

    /**
     * Financial Summary
     */
    summary: {
        /**
         * Get financial summary for a user
         */
        get: async (
            userId: string,
            filters?: {
                startDate?: string;
                endDate?: string;
            }
        ): Promise<ApiResponse<Summary>> => {
            const params = new URLSearchParams();
            if (filters?.startDate) params.append('startDate', filters.startDate);
            if (filters?.endDate) params.append('endDate', filters.endDate);

            const queryString = params.toString();
            const url = `${API_BASE_URL}/summary/${userId}${queryString ? `?${queryString}` : ''}`;

            const response = await fetch(url);
            return response.json();
        },
    },

    /**
     * Savings Recommendations
     */
    recommendations: {
        /**
         * Get ML-based savings recommendations
         */
        get: async (userId: string): Promise<ApiResponse<Recommendation>> => {
            const response = await fetch(`${API_BASE_URL}/recommendations/${userId}`);
            return response.json();
        },
    },

    /**
     * Financial News
     */
    news: {
        /**
         * Get financial news feed
         */
        get: async (): Promise<ApiResponse<{ articles: NewsArticle[]; totalResults: number }>> => {
            const response = await fetch(`${API_BASE_URL}/news`);
            return response.json();
        },
    },

    /**
     * Health Check
     */
    health: {
        /**
         * Check if API is running
         */
        check: async (): Promise<ApiResponse> => {
            const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
            return response.json();
        },
    },
};

/**
 * Expense categories (matches backend)
 */
export const EXPENSE_CATEGORIES = [
    'Food & Dining',
    'Transportation',
    'Housing',
    'Utilities',
    'Healthcare',
    'Entertainment',
    'Shopping',
    'Education',
    'Personal Care',
    'Insurance',
    'Savings & Investments',
    'Other',
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];
