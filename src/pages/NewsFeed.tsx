import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  Newspaper,
  ExternalLink,
  Clock,
  TrendingUp,
  Building2,
  Wallet,
  Bitcoin,
  BarChart3,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { newsApi, NewsItem } from '@/services/api';
import { cn } from '@/lib/utils';

const categoryConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  markets: { icon: TrendingUp, color: 'text-chart-1', label: 'Markets' },
  economy: { icon: Building2, color: 'text-chart-2', label: 'Economy' },
  'personal-finance': { icon: Wallet, color: 'text-chart-3', label: 'Personal Finance' },
  crypto: { icon: Bitcoin, color: 'text-chart-4', label: 'Crypto' },
  stocks: { icon: BarChart3, color: 'text-chart-6', label: 'Stocks' },
};

const NewsFeed = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [visibleCount, setVisibleCount] = useState(5);

  useEffect(() => {
    setVisibleCount(5); // Reset limit when filter changes
  }, [activeFilter]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await newsApi.get(activeFilter === 'all' ? undefined : activeFilter);
        setNews(data);
      } catch (error) {
        console.error('Failed to fetch news:', error);
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    fetchNews();
  }, [activeFilter]);

  const filteredNews = activeFilter === 'all'
    ? news
    : news.filter(item => item.category === activeFilter);

  const displayedNews = filteredNews.slice(0, visibleCount);

  if (loading && news.length === 0) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-muted rounded animate-pulse" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="h-32 animate-pulse bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Market News</h1>
        <p className="text-muted-foreground mt-1">
          Stay updated with the latest financial news
        </p>
      </div>

      {/* Filter Tabs */}
      <Tabs defaultValue="all" value={activeFilter} onValueChange={setActiveFilter}>
        <TabsList className="h-auto flex-wrap gap-1 bg-transparent p-0">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Filter className="h-4 w-4 mr-1" />
            All News
          </TabsTrigger>
          {Object.entries(categoryConfig).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <TabsTrigger
                key={key}
                value={key}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Icon className="h-4 w-4 mr-1" />
                {config.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={activeFilter} className="mt-6">
          <div className="space-y-4">
            {filteredNews.length === 0 ? (
              <Card className="dashboard-card">
                <CardContent className="py-12 text-center">
                  <Newspaper className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No news articles found for this category.</p>
                </CardContent>
              </Card>
            ) : (
              displayedNews.map((item, index) => {
                const config = categoryConfig[item.category];
                const Icon = config?.icon || Newspaper;

                return (
                  <Card
                    key={item.id}
                    className="dashboard-card group cursor-pointer animate-slide-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CardContent className="p-5">
                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* Category Icon */}
                        <div className={cn(
                          'p-3 rounded-lg bg-secondary h-fit',
                          config?.color || 'text-muted-foreground'
                        )}>
                          <Icon className="h-6 w-6" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <Badge variant="secondary" className="text-xs">
                                  {config?.label || item.category}
                                </Badge>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                                </span>
                              </div>
                              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                                {item.headline}
                              </h3>
                              {item.summary && (
                                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                  {item.summary}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground mt-2">
                                Source: {item.source}
                              </p>
                            </div>

                            {/* Read More Button */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              asChild
                            >
                              <a href={item.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Load More */}
      {visibleCount < filteredNews.length && (
        <div className="text-center">
          <Button
            variant="outline"
            className="px-8"
            onClick={() => setVisibleCount(prev => prev + 5)}
          >
            Load More Articles
          </Button>
        </div>
      )}
    </div>
  );
};

export default NewsFeed;
