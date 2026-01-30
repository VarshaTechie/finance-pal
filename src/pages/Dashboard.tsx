import { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { summaryApi, Summary } from '@/services/api';
import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const COLORS = [
  'hsl(166, 72%, 37%)', // Primary teal
  'hsl(199, 89%, 48%)', // Info blue
  'hsl(38, 92%, 50%)',  // Accent amber
  'hsl(280, 65%, 60%)', // Purple
  'hsl(0, 84%, 60%)',   // Destructive red
  'hsl(142, 76%, 36%)', // Success green
];

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  variant: 'primary' | 'success' | 'accent' | 'info';
}

const StatCard = ({ title, value, change, changeType, icon, variant }: StatCardProps) => {
  const variantClasses = {
    primary: 'stat-card-primary',
    success: 'stat-card-success',
    accent: 'stat-card-accent',
    info: 'stat-card-info',
  };

  return (
    <Card className={`${variantClasses[variant]} border-0 overflow-hidden`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium opacity-90">{title}</p>
            <p className="text-3xl font-bold mt-2">{value}</p>
            <div className="flex items-center gap-1 mt-2 text-sm opacity-90">
              {changeType === 'positive' ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : changeType === 'negative' ? (
                <ArrowDownRight className="h-4 w-4" />
              ) : null}
              <span>{change}</span>
            </div>
          </div>
          <div className="p-3 rounded-full bg-white/20">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const Dashboard = () => {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await summaryApi.get();
        setSummary(data);
      } catch (error) {
        console.error('Failed to fetch summary:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-36 animate-pulse bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (!summary) {
    return <div>Failed to load dashboard data</div>;
  }

  const savingsPercentage = ((summary.estimatedSavings / summary.monthlyIncome) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Your financial overview for January 2026
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="animate-slide-up">
          <StatCard
            title="Monthly Income"
            value={formatCurrency(summary.monthlyIncome)}
            change="+₹5,000 from last month"
            changeType="positive"
            icon={<Wallet className="h-6 w-6" />}
            variant="primary"
          />
        </div>
        <div className="animate-slide-up delay-100">
          <StatCard
            title="Total Expenses"
            value={formatCurrency(summary.totalExpenses)}
            change="-₹7,000 from last month"
            changeType="positive"
            icon={<TrendingDown className="h-6 w-6" />}
            variant="accent"
          />
        </div>
        <div className="animate-slide-up delay-200">
          <StatCard
            title="Estimated Savings"
            value={formatCurrency(summary.estimatedSavings)}
            change={`${savingsPercentage}% savings rate`}
            changeType="neutral"
            icon={<PiggyBank className="h-6 w-6" />}
            variant="success"
          />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Expense Breakdown */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={summary.expensesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="amount"
                    nameKey="category"
                    label={({ category, percentage }) => `${category} (${percentage.toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {summary.expensesByCategory.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Monthly Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={summary.monthlyTrend}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(166, 72%, 37%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(166, 72%, 37%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(value) => `₹${value / 1000}k`}
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stroke="hsl(166, 72%, 37%)"
                    fillOpacity={1}
                    fill="url(#colorIncome)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    stroke="hsl(38, 92%, 50%)"
                    fillOpacity={1}
                    fill="url(#colorExpenses)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Quick Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary">
              <div className="p-2 rounded-full bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Savings Rate</p>
                <p className="text-lg font-semibold">{savingsPercentage}%</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary">
              <div className="p-2 rounded-full bg-accent/10">
                <Wallet className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Daily Spend</p>
                <p className="text-lg font-semibold">{formatCurrency(summary.totalExpenses / 30)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary">
              <div className="p-2 rounded-full bg-success/10">
                <PiggyBank className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Top Expense</p>
                <p className="text-lg font-semibold">Rent</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary">
              <div className="p-2 rounded-full bg-info/10">
                <TrendingDown className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Budget Status</p>
                <p className="text-lg font-semibold text-success">On Track</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
