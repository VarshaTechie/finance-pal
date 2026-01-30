import { useEffect, useState } from 'react';
import { 
  PiggyBank, 
  TrendingDown, 
  Lightbulb, 
  Target,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { recommendationsApi, Recommendation } from '@/services/api';

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const data = await recommendationsApi.get();
        setRecommendations(data);
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-muted rounded animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-40 animate-pulse bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (!recommendations) {
    return <div>Failed to load recommendations</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Savings Recommendations</h1>
        <p className="text-muted-foreground mt-1">
          AI-powered insights to help you save more
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="dashboard-card stat-card-success border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Target className="h-8 w-8 opacity-90" />
              <Badge className="bg-white/20 text-white border-0">Goal</Badge>
            </div>
            <p className="text-sm opacity-90">Suggested Monthly Savings</p>
            <p className="text-3xl font-bold mt-1">
              {formatCurrency(recommendations.suggestedSavings)}
            </p>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <PiggyBank className="h-8 w-8 text-primary" />
              <Badge variant="secondary">Current</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Current Savings Rate</p>
            <div className="flex items-end gap-2 mt-1">
              <p className="text-3xl font-bold">{recommendations.currentSavingsRate}%</p>
              <ArrowRight className="h-5 w-5 text-muted-foreground mb-1" />
              <p className="text-lg text-primary font-semibold mb-0.5">
                {recommendations.targetSavingsRate}%
              </p>
            </div>
            <Progress 
              value={recommendations.currentSavingsRate} 
              className="mt-3 h-2"
            />
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingDown className="h-8 w-8 text-accent" />
              <Badge variant="secondary">Potential</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Total Potential Savings</p>
            <p className="text-3xl font-bold mt-1 text-success">
              {formatCurrency(
                recommendations.categoryReductions.reduce(
                  (sum, cat) => sum + cat.potentialSavings, 
                  0
                )
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Reductions */}
      <Card className="dashboard-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>Category-wise Recommendations</CardTitle>
          </div>
          <CardDescription>
            Areas where you can reduce spending based on your patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.categoryReductions.map((reduction, index) => (
              <div 
                key={reduction.category}
                className="p-4 rounded-lg bg-secondary/50 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-foreground">{reduction.category}</h4>
                      <Badge className="badge-success text-xs">
                        Save {formatCurrency(reduction.potentialSavings)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{reduction.tip}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-center">
                      <p className="text-muted-foreground">Current</p>
                      <p className="font-semibold text-foreground">
                        {formatCurrency(reduction.currentSpend)}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <div className="text-center">
                      <p className="text-muted-foreground">Target</p>
                      <p className="font-semibold text-success">
                        {formatCurrency(reduction.suggestedSpend)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card className="dashboard-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-accent" />
            <CardTitle>Financial Insights</CardTitle>
          </div>
          <CardDescription>
            Personalized tips based on your spending behavior
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {recommendations.insights.map((insight, index) => (
              <div 
                key={index}
                className="flex items-start gap-3 p-4 rounded-lg bg-secondary/50 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-1.5 rounded-full bg-primary/10">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <p className="text-sm text-foreground">{insight}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Recommendations;
