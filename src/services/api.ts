import axios, { AxiosError } from 'axios';

// API base URL - can be configured via environment variable
const API_BASE_URL = 'http://localhost:5000/api';
// Demo User ID (Hardcoded for immediate dashboard access)
const DEMO_USER_ID = '697df75d40b344604c69ec9f';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
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
  source?: string;
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
  | 'Shopping'
  | 'Others';

export type IncomeSource =
  | 'Salary'
  | 'Freelance'
  | 'Business'
  | 'Investment'
  | 'Bonus'
  | 'Rental'
  | 'Other';

export interface Summary {
  monthlyIncome: number;
  totalExpenses: number;
  estimatedSavings: number;
  expensesByCategory: { category: string; amount: number; percentage: number }[];
  monthlyTrend: { month: string; expenses: number; income: number }[];
  comparison?: {
    previousTotalExpenses: number;
    expenseChange: number;
    incomeChange: number;
    savingsChange: number;
  };
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

// Helper to check if we should use mock data
// We keep this just in case, but we try to avoid using it
const shouldUseMock = (error: unknown): boolean => {
  return false; // Force real API usage where possible
};

// API Functions
export const incomeApi = {
  save: async (income: Omit<Income, 'id' | 'createdAt'>): Promise<Income> => {
    try {
      // Map month name to index
      const monthIndex = new Date(`${income.month} 1, 2000`).getMonth();

      // Map frontend model to backend expected body
      const backendBody = {
        userId: DEMO_USER_ID, // Use demo ID for updates too
        name: "Main User",
        email: "main@finance.com",
        monthlyIncome: income.amount,
        month: monthIndex, // Pass month index (0-11)
        year: income.year,
        source: income.source || 'Salary' // Include income source
      };

      const response = await api.post('/income', backendBody);

      // Return correctly mapped response
      return {
        amount: response.data.data.monthlyIncome,
        currency: '₹',
        month: income.month,
        year: income.year,
        source: income.source,
        id: response.data.data._id
      };
    } catch (error) {
      console.error("Income save failed", error);
      throw error;
    }
  },

  get: async (): Promise<Income | null> => {
    try {
      const response = await api.get(`/income/${DEMO_USER_ID}`);
      if (response.data.success) {
        return {
          amount: response.data.data.monthlyIncome,
          currency: '₹',
          month: 'January', // Backend doesn't store this yet, defaulting
          year: 2026,
          id: response.data.data._id
        };
      }
      return null;
    } catch (error) {
      console.error("Income fetch failed", error);
      // Fallback to default for smoother UX if API fails
      return {
        amount: 85000,
        currency: '₹',
        month: 'January',
        year: 2026,
      };
    }
  },
};

export const expenseApi = {
  save: async (expense: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense> => {
    try {
      const backendBody = {
        userId: DEMO_USER_ID,
        amount: expense.amount,
        category: expense.category,
        date: expense.date,
        description: expense.description || ''
      };

      const response = await api.post('/expenses', backendBody);

      return {
        ...expense,
        id: response.data.data._id,
        createdAt: response.data.data.createdAt
      };
    } catch (error) {
      console.error("Expense save failed", error);
      throw error;
    }
  },

  getAll: async (): Promise<Expense[]> => {
    try {
      const response = await api.get(`/expenses/${DEMO_USER_ID}`);
      if (response.data.success && Array.isArray(response.data.data)) {
        return response.data.data.map((item: any) => ({
          id: item._id,
          amount: item.amount,
          category: item.category as ExpenseCategory,
          date: item.date,
          description: item.description,
          createdAt: item.createdAt
        }));
      }
      return [];
    } catch (error) {
      console.error("Expenses fetch failed", error);
      return [];
    }
  },
};

export const summaryApi = {
  get: async (period?: { month: number; year: number }): Promise<Summary> => {
    try {
      let url = `/summary/${DEMO_USER_ID}`;

      if (period) {
        // Construct date range for the selected month/year
        // Create date objects in local time
        const startDate = new Date(period.year, period.month, 1);
        const endDate = new Date(period.year, period.month + 1, 0); // Last day of month

        // Format as YYYY-MM-DD for backend
        // Note: We use manual formatting to avoid timezone shifts affecting the date string
        const startStr = `${period.year}-${String(period.month + 1).padStart(2, '0')}-01`;
        const endStr = `${period.year}-${String(period.month + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;

        url += `?startDate=${startStr}&endDate=${endStr}`;
      }

      const response = await api.get(url);
      if (response.data.success) {
        const data = response.data.data;

        // Map category breakdown object to array
        const expensesByCategory = Object.entries(data.categoryBreakdown || {}).map(([category, amount]) => ({
          category,
          amount: Number(amount),
          percentage: data.totalExpenses > 0 ? (Number(amount) / data.totalExpenses) * 100 : 0
        }));

        return {
          monthlyIncome: data.monthlyIncome,
          totalExpenses: data.totalExpenses,
          estimatedSavings: data.balance, // 'balance' in backend is 'estimatedSavings' here
          expensesByCategory: expensesByCategory,
          comparison: data.comparison, // Pass through comparison data
          // Mock trend data for charts (backend feature pending)
          monthlyTrend: [
            { month: 'Aug', expenses: 42000, income: data.monthlyIncome },
            { month: 'Sep', expenses: 48000, income: data.monthlyIncome },
            { month: 'Oct', expenses: 44000, income: data.monthlyIncome },
            { month: 'Nov', expenses: 46000, income: data.monthlyIncome + 3000 },
            { month: 'Dec', expenses: 52000, income: data.monthlyIncome + 5000 },
            { month: 'Jan', expenses: data.totalExpenses, income: data.monthlyIncome },
          ]
        };
      }
      // Should not happen if backend is running
      throw new Error("Failed to fetch summary");
    } catch (error) {
      console.error("Summary fetch failed", error);
      throw error;
    }
  },
};

export const recommendationsApi = {
  get: async (): Promise<Recommendation> => {
    try {
      const response = await api.get(`/recommendations/${DEMO_USER_ID}`);
      if (response.data.success) {
        const data = response.data.data;

        // Map backend suggestion object to array
        const categoryReductions = Object.entries(data.categorySuggestions || {}).map(([category, details]: [string, any]) => ({
          category: category,
          currentSpend: details.currentSpending,
          suggestedSpend: details.recommendedSpending,
          potentialSavings: details.potentialSavings,
          tip: details.status === 'overspending'
            ? `Reduce ${category} spending by ₹${details.potentialSavings}`
            : `Good job on ${category}!`
        }));

        return {
          id: new Date().toISOString(),
          suggestedSavings: data.recommendedSavings,
          currentSavingsRate: 100 - data.expenseToIncomeRatio,
          targetSavingsRate: 20, // 20% rule
          categoryReductions: categoryReductions,
          insights: [
            data.expenseToIncomeRatio > 50 ? 'Expenses are high (over 50% of income)' : 'Expenses are within healthy limits',
            `You could save ₹${data.recommendedSavings.toLocaleString()} more per month`,
            'Emergency fund recommended: 6x monthly expenses'
          ]
        };
      }
      throw new Error("Failed to fetch recommendations");
    } catch (error) {
      console.error("Recommendations fetch failed", error);
      // Fallback mock
      return {
        id: '1',
        suggestedSavings: 0,
        currentSavingsRate: 0,
        targetSavingsRate: 20,
        categoryReductions: [],
        insights: ['Add expenses to see recommendations']
      };
    }
  },
};

// Helper to categorize news based on content
const categorizeArticle = (title: string, description: string): NewsItem['category'] => {
  const text = `${title} ${description}`.toLowerCase();

  if (text.match(/bitcoin|crypto|ethereum|blockchain|coin|token/)) return 'crypto';
  if (text.match(/economy|inflation|gdp|rate|bank|fed|tax|recession/)) return 'economy';
  if (text.match(/saving|invest|retirement|wealth|money|planning|budget|expense/)) return 'personal-finance';
  if (text.match(/stock|share|equity|dividend|nasdaq|dow|s&p/)) return 'stocks';

  return 'markets';
};

export const newsApi = {
  get: async (category?: string): Promise<NewsItem[]> => {
    const mockNews: NewsItem[] = [
      { id: '1', headline: 'Market Rally', source: 'FT', timestamp: new Date().toISOString(), url: '#', category: 'markets' }
    ];

    try {
      const { data } = await axios.get('http://localhost:5000/api/news');
      if (data.success && Array.isArray(data.articles)) {
        return data.articles.map((item: any) => ({
          id: String(item.id),
          headline: item.title,
          source: item.source,
          timestamp: item.publishedAt,
          url: item.url,
          category: categorizeArticle(item.title || '', item.description || ''),
          summary: item.description
        }));
      }
    } catch (error) {
      console.warn('Backend API unavailable, using mock data');
    }

    if (category) {
      return mockNews.filter(item => item.category === category);
    }
    return mockNews;
  },
};

export const exportApi = {
  /**
   * Export financial data as CSV
   * @param type - 'expenses' | 'income' | 'all'
   * @param startDate - Optional start date (YYYY-MM-DD)
   * @param endDate - Optional end date (YYYY-MM-DD)
   */
  downloadCSV: async (
    type: 'expenses' | 'income' | 'all' = 'all',
    startDate?: string,
    endDate?: string
  ): Promise<void> => {
    try {
      let url = `/export/${DEMO_USER_ID}?type=${type}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;

      const response = await api.get(url, {
        responseType: 'blob', // Important for file download
      });

      const getFilenameFromContentDisposition = (cd?: string): string | null => {
        if (!cd) return null;
        // Examples:
        // content-disposition: attachment; filename="file.csv"
        // content-disposition: attachment; filename=file.csv
        const match = cd.match(/filename\*?=(?:UTF-8''|")?([^\";]+)\"?/i);
        if (!match) return null;
        try {
          return decodeURIComponent(match[1]);
        } catch {
          return match[1];
        }
      };

      // Create a blob from the response
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8' });
      
      // Create a temporary URL and trigger download
      const url_blob = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url_blob;
      
      // Prefer server-provided filename, fallback to a reasonable default
      const headerFilename =
        getFilenameFromContentDisposition((response.headers as any)?.['content-disposition']) ||
        getFilenameFromContentDisposition((response.headers as any)?.['Content-Disposition']);

      const filename = headerFilename || `finance-export-${new Date().toISOString().split('T')[0]}.csv`;
      link.setAttribute('download', filename);
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url_blob);
    } catch (error) {
      console.error('CSV export failed', error);
      throw error;
    }
  },
};

export default api;
