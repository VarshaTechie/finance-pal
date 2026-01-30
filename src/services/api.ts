import axios, { AxiosError } from 'axios';

// API base URL - can be configured via environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 2000, // Short timeout since we fallback to mock data
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface Income {
  id?: string;
  amount: number;
  currency: string;
  month: string;
  year: number;
  createdAt?: string;
}

export interface Expense {
  id?: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  description?: string;
  createdAt?: string;
}

export type ExpenseCategory = 
  | 'Food' 
  | 'Travel' 
  | 'Rent' 
  | 'Entertainment' 
  | 'Utilities' 
  | 'Others';

export interface Summary {
  monthlyIncome: number;
  totalExpenses: number;
  estimatedSavings: number;
  expensesByCategory: { category: string; amount: number; percentage: number }[];
  monthlyTrend: { month: string; expenses: number; income: number }[];
}

export interface Recommendation {
  id: string;
  suggestedSavings: number;
  currentSavingsRate: number;
  targetSavingsRate: number;
  categoryReductions: {
    category: string;
    currentSpend: number;
    suggestedSpend: number;
    potentialSavings: number;
    tip: string;
  }[];
  insights: string[];
}

export interface NewsItem {
  id: string;
  headline: string;
  source: string;
  timestamp: string;
  url: string;
  category: 'markets' | 'economy' | 'personal-finance' | 'crypto' | 'stocks';
  summary?: string;
}

// Mock data for fallback
const mockSummary: Summary = {
  monthlyIncome: 75000,
  totalExpenses: 45000,
  estimatedSavings: 30000,
  expensesByCategory: [
    { category: 'Rent', amount: 15000, percentage: 33.3 },
    { category: 'Food', amount: 10000, percentage: 22.2 },
    { category: 'Travel', amount: 5000, percentage: 11.1 },
    { category: 'Utilities', amount: 5000, percentage: 11.1 },
    { category: 'Entertainment', amount: 5000, percentage: 11.1 },
    { category: 'Others', amount: 5000, percentage: 11.1 },
  ],
  monthlyTrend: [
    { month: 'Aug', expenses: 42000, income: 75000 },
    { month: 'Sep', expenses: 48000, income: 75000 },
    { month: 'Oct', expenses: 44000, income: 75000 },
    { month: 'Nov', expenses: 46000, income: 78000 },
    { month: 'Dec', expenses: 52000, income: 80000 },
    { month: 'Jan', expenses: 45000, income: 75000 },
  ],
};

const mockRecommendations: Recommendation = {
  id: '1',
  suggestedSavings: 35000,
  currentSavingsRate: 40,
  targetSavingsRate: 50,
  categoryReductions: [
    {
      category: 'Entertainment',
      currentSpend: 5000,
      suggestedSpend: 3500,
      potentialSavings: 1500,
      tip: 'Consider streaming services instead of frequent movie outings',
    },
    {
      category: 'Food',
      currentSpend: 10000,
      suggestedSpend: 8000,
      potentialSavings: 2000,
      tip: 'Meal prepping on weekends can reduce dining out expenses',
    },
    {
      category: 'Travel',
      currentSpend: 5000,
      suggestedSpend: 3500,
      potentialSavings: 1500,
      tip: 'Use public transport or carpooling for daily commute',
    },
  ],
  insights: [
    'Your savings rate is good but can be improved to reach financial goals faster',
    'Consider setting up automatic transfers to a savings account',
    'Emergency fund should cover 6 months of expenses (₹2.7L recommended)',
    'Look into tax-saving investments under Section 80C',
  ],
};

const mockNews: NewsItem[] = [
  {
    id: '1',
    headline: 'RBI Maintains Repo Rate at 6.5% for Fifth Consecutive Time',
    source: 'Economic Times',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    url: '#',
    category: 'economy',
    summary: 'The Reserve Bank of India kept the benchmark interest rate unchanged, citing inflation concerns.',
  },
  {
    id: '2',
    headline: 'Sensex Hits All-Time High, Crosses 73,000 Mark',
    source: 'Moneycontrol',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    url: '#',
    category: 'markets',
    summary: 'Indian stock markets rallied on strong FII inflows and positive global cues.',
  },
  {
    id: '3',
    headline: 'New Tax Regime vs Old: Which is Better for Salaried Employees?',
    source: 'Livemint',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    url: '#',
    category: 'personal-finance',
    summary: 'A comprehensive guide to help you choose the right tax regime based on your deductions.',
  },
  {
    id: '4',
    headline: 'Gold Prices Surge Amid Global Uncertainty',
    source: 'Business Standard',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    url: '#',
    category: 'markets',
    summary: 'Gold prices hit record highs as investors seek safe-haven assets.',
  },
  {
    id: '5',
    headline: 'SIP Investments Cross ₹18,000 Crore Monthly Milestone',
    source: 'NDTV Profit',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    url: '#',
    category: 'personal-finance',
    summary: 'Retail investors continue to pour money into mutual funds through systematic investment plans.',
  },
  {
    id: '6',
    headline: 'Bitcoin Crosses $50,000 for First Time Since 2021',
    source: 'CoinDesk',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    url: '#',
    category: 'crypto',
    summary: 'The cryptocurrency market sees renewed interest ahead of Bitcoin halving event.',
  },
];

// Helper to check if we should use mock data
const shouldUseMock = (error: unknown): boolean => {
  if (error instanceof AxiosError) {
    // Use mock if network error or server not available
    return error.code === 'ERR_NETWORK' || 
           error.response?.status === 404 ||
           error.code === 'ECONNABORTED';
  }
  return true;
};

// API Functions
export const incomeApi = {
  save: async (income: Omit<Income, 'id' | 'createdAt'>): Promise<Income> => {
    try {
      const response = await api.post<Income>('/income', income);
      return response.data;
    } catch (error) {
      if (shouldUseMock(error)) {
        // Return mock response for demo
        return {
          ...income,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        };
      }
      throw error;
    }
  },

  get: async (): Promise<Income | null> => {
    try {
      const response = await api.get<Income>('/income');
      return response.data;
    } catch (error) {
      if (shouldUseMock(error)) {
        return {
          amount: 75000,
          currency: '₹',
          month: 'January',
          year: 2026,
        };
      }
      throw error;
    }
  },
};

export const expenseApi = {
  save: async (expense: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense> => {
    try {
      const response = await api.post<Expense>('/expenses', expense);
      return response.data;
    } catch (error) {
      if (shouldUseMock(error)) {
        return {
          ...expense,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        };
      }
      throw error;
    }
  },

  getAll: async (): Promise<Expense[]> => {
    try {
      const response = await api.get<Expense[]>('/expenses');
      return response.data;
    } catch (error) {
      if (shouldUseMock(error)) {
        return [];
      }
      throw error;
    }
  },
};

export const summaryApi = {
  get: async (): Promise<Summary> => {
    // Return mock data directly for demo (no backend connected)
    // When a real API is available, uncomment the try-catch below
    return mockSummary;
    /*
    try {
      const response = await api.get<Summary>('/summary');
      return response.data;
    } catch (error) {
      if (shouldUseMock(error)) {
        return mockSummary;
      }
      throw error;
    }
    */
  },
};

export const recommendationsApi = {
  get: async (): Promise<Recommendation> => {
    // Return mock data directly for demo
    return mockRecommendations;
  },
};

export const newsApi = {
  get: async (category?: string): Promise<NewsItem[]> => {
    // Return mock data directly for demo
    if (category) {
      return mockNews.filter(item => item.category === category);
    }
    return mockNews;
  },
};

export default api;
