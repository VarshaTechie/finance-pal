const axios = require('axios');

/**
 * Mock financial news data for fallback
 */
const mockNewsData = [
    {
        id: 1,
        title: "Stock Market Reaches New Heights Amid Economic Recovery",
        description: "Major indices show strong performance as investors remain optimistic about economic growth prospects.",
        source: "Financial Times",
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        url: "https://example.com/news/1",
        category: "Markets"
    },
    {
        id: 2,
        title: "Central Bank Maintains Interest Rates",
        description: "The central bank decided to keep interest rates unchanged, citing stable inflation and economic conditions.",
        source: "Economic Daily",
        publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        url: "https://example.com/news/2",
        category: "Economy"
    },
    {
        id: 3,
        title: "Tech Stocks Lead Market Rally",
        description: "Technology sector shows robust growth with major companies reporting strong quarterly earnings.",
        source: "Tech Finance",
        publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        url: "https://example.com/news/3",
        category: "Technology"
    },
    {
        id: 4,
        title: "Gold Prices Stabilize After Recent Volatility",
        description: "Precious metals market shows signs of stabilization as investors reassess their portfolios.",
        source: "Commodity News",
        publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        url: "https://example.com/news/4",
        category: "Commodities"
    },
    {
        id: 5,
        title: "Personal Finance Tips for the New Year",
        description: "Financial experts share strategies for better money management and achieving savings goals.",
        source: "Money Matters",
        publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        url: "https://example.com/news/5",
        category: "Personal Finance"
    }
];

/**
 * Fetch financial news
 * Uses NewsAPI if available, otherwise falls back to mock data
 */
const fetchFinancialNews = async () => {
    try {
        // const apiKey = process.env.NEWS_API_KEY ? process.env.NEWS_API_KEY.trim() : '';
        const apiKey = '8714f10c25754fc386086681ea477dab';

        // Debug logging
        if (!apiKey) {
            console.log('⚠️ No NEWS_API_KEY found in environment variables');
        } else if (apiKey === 'your_news_api_key_here_optional') {
            console.log('⚠️ NEWS_API_KEY is still set to placeholder');
        } else {
            console.log(`📡 Fetching news with API Key: ${apiKey.substring(0, 4)}...`);

            try {
                const response = await axios.get('https://newsapi.org/v2/top-headlines', {
                    params: {
                        category: 'business',
                        country: 'us',
                        apiKey: apiKey
                    }
                });

                if (response.data.status === 'ok') {
                    console.log(`✅ Successfully fetched ${response.data.articles.length} articles from NewsAPI`);

                    // Map NewsAPI format to our application format if needed
                    // Here we just return the raw articles, but structured cleanly
                    const articles = response.data.articles.map((article, index) => ({
                        id: index,
                        title: article.title,
                        description: article.description || "No description available",
                        source: article.source.name,
                        publishedAt: article.publishedAt,
                        url: article.url,
                        category: "Business" // API default
                    }));

                    return {
                        success: true,
                        articles: articles,
                        totalResults: response.data.totalResults
                    };
                }
            } catch (apiError) {
                console.error('❌ NewsAPI Error:', apiError.message);
                if (apiError.response) {
                    console.error('   Status:', apiError.response.status);
                    console.error('   Data:', JSON.stringify(apiError.response.data));
                }
                // Continue to mock data
            }
        }

        console.log('ℹ️ Falling back to mock news data');
        // Simulate delay for consistent UX
        await new Promise(resolve => setTimeout(resolve, 500));

        return {
            success: true,
            articles: mockNewsData,
            totalResults: mockNewsData.length
        };
    } catch (error) {
        console.error('Error fetching news:', error);
        throw error;
    }
};

/**
 * Filter news by category
 */
const filterNewsByCategory = (category) => {
    return mockNewsData.filter(news =>
        news.category.toLowerCase() === category.toLowerCase()
    );
};

module.exports = {
    fetchFinancialNews,
    filterNewsByCategory
};
