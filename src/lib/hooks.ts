/**
 * Custom React Hooks for Finance Pal API
 * 
 * These hooks make it even easier to use the API in your components
 * with built-in loading states and error handling
 */

import { useState, useEffect, useCallback } from 'react';
import { api } from './api';

/**
 * Hook to manage user context (stores userId)
 */
export function useUser() {
    const [userId, setUserId] = useState<string | null>(() => {
        return localStorage.getItem('userId');
    });

    const saveUserId = useCallback((id: string) => {
        localStorage.setItem('userId', id);
        setUserId(id);
    }, []);

    const clearUserId = useCallback(() => {
        localStorage.removeItem('userId');
        setUserId(null);
    }, []);

    return { userId, saveUserId, clearUserId };
}

/**
 * Hook to fetch and manage user income
 */
export function useIncome(userId: string | null) {
    const [income, setIncome] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchIncome = useCallback(async () => {
        if (!userId) return;

        setLoading(true);
        setError(null);

        try {
            const result = await api.income.get(userId);
            if (result.success && result.data) {
                setIncome(result.data);
            } else {
                setError(result.message || 'Failed to fetch income');
            }
        } catch (err) {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchIncome();
    }, [fetchIncome]);

    return { income, loading, error, refetch: fetchIncome };
}

/**
 * Hook to fetch and manage expenses
 */
export function useExpenses(userId: string | null, filters?: {
    startDate?: string;
    endDate?: string;
    category?: string;
}) {
    const [expenses, setExpenses] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchExpenses = useCallback(async () => {
        if (!userId) return;

        setLoading(true);
        setError(null);

        try {
            const result = await api.expenses.getAll(userId, filters);
            if (result.success && result.data) {
                setExpenses(result.data);
            } else {
                setError(result.message || 'Failed to fetch expenses');
            }
        } catch (err) {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    }, [userId, filters]);

    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    const addExpense = useCallback(async (data: {
        amount: number;
        category: string;
        date?: string;
        description?: string;
    }) => {
        if (!userId) return;

        try {
            const result = await api.expenses.add({ userId, ...data });
            if (result.success) {
                await fetchExpenses(); // Refresh list
                return result;
            }
            throw new Error(result.message);
        } catch (err) {
            throw err;
        }
    }, [userId, fetchExpenses]);

    const deleteExpense = useCallback(async (expenseId: string) => {
        try {
            const result = await api.expenses.delete(expenseId);
            if (result.success) {
                await fetchExpenses(); // Refresh list
                return result;
            }
            throw new Error(result.message);
        } catch (err) {
            throw err;
        }
    }, [fetchExpenses]);

    return {
        expenses,
        loading,
        error,
        refetch: fetchExpenses,
        addExpense,
        deleteExpense
    };
}

/**
 * Hook to fetch financial summary
 */
export function useSummary(userId: string | null, filters?: {
    startDate?: string;
    endDate?: string;
}) {
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSummary = useCallback(async () => {
        if (!userId) return;

        setLoading(true);
        setError(null);

        try {
            const result = await api.summary.get(userId, filters);
            if (result.success && result.data) {
                setSummary(result.data);
            } else {
                setError(result.message || 'Failed to fetch summary');
            }
        } catch (err) {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    }, [userId, filters]);

    useEffect(() => {
        fetchSummary();
    }, [fetchSummary]);

    return { summary, loading, error, refetch: fetchSummary };
}

/**
 * Hook to fetch recommendations
 */
export function useRecommendations(userId: string | null) {
    const [recommendations, setRecommendations] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRecommendations = useCallback(async () => {
        if (!userId) return;

        setLoading(true);
        setError(null);

        try {
            const result = await api.recommendations.get(userId);
            if (result.success && result.data) {
                setRecommendations(result.data);
            } else {
                setError(result.message || 'Failed to fetch recommendations');
            }
        } catch (err) {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    return {
        recommendations,
        loading,
        error,
        generate: fetchRecommendations
    };
}

/**
 * Hook to fetch financial news
 */
export function useNews() {
    const [news, setNews] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchNews = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await api.news.get();
            if (result.success && result.data) {
                setNews(result.data.articles || []);
            } else {
                setError(result.message || 'Failed to fetch news');
            }
        } catch (err) {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNews();
    }, [fetchNews]);

    return { news, loading, error, refetch: fetchNews };
}

/**
 * Example usage of hooks in a component:
 * 
 * function Dashboard() {
 *   const { userId } = useUser();
 *   const { summary, loading } = useSummary(userId);
 *   const { expenses, addExpense } = useExpenses(userId);
 *   const { recommendations, generate } = useRecommendations(userId);
 * 
 *   if (loading) return <div>Loading...</div>;
 * 
 *   return (
 *     <div>
 *       <h1>Your Financial Dashboard</h1>
 *       <p>Balance: ₹{summary?.remainingBalance}</p>
 *       <button onClick={generate}>Get Recommendations</button>
 *     </div>
 *   );
 * }
 */
