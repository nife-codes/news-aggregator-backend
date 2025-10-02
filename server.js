const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// CATEGORY MAPPING - Maps frontend categories to NewsAPI categories
const categoryMap = {
  'All': 'general',
  'Technology': 'technology',
  'Business': 'business',
  'Science': 'science',
  'Entertainment': 'entertainment',
  'Sports': 'sports'
};

// Real news endpoint with proper category mapping
app.get('/api/news', async (req, res) => {
  try {
    const { category = 'All' } = req.query;
    
    // Map frontend category to NewsAPI category
    const newsApiCategory = categoryMap[category] || 'general';
    
    console.log(`📰 Fetching news - Frontend: "${category}" → NewsAPI: "${newsApiCategory}"`);
    
    const response = await axios.get('https://newsapi.org/v2/top-headlines', {
      params: {
        country: 'us',
        category: newsApiCategory,
        pageSize: 20,
        apiKey: process.env.NEWS_API_KEY
      }
    });

    console.log(`✅ NewsAPI response: ${response.data.articles.length} articles for ${category}`);

    const articles = response.data.articles
      .filter(article => article.title && article.title !== '[Removed]')
      .map((article, index) => ({
        id: index + 1,
        title: article.title,
        description: article.description || 'No description available',
        source: article.source?.name || 'Unknown source',
        publishedAt: article.publishedAt || new Date().toISOString(),
        url: article.url || '#',
        imageUrl: article.urlToImage || null,
        category: category
      }));

    if (articles.length === 0) {
      console.log('⚠️ No articles found, using fallback data');
      return res.json(getFallbackArticles(category));
    }

    res.json(articles);
  } catch (error) {
    console.error('❌ NewsAPI error:', error.response?.data || error.message);
    res.json(getFallbackArticles(req.query.category || 'All'));
  }
});

// Helper function for category-specific fallback articles
function getFallbackArticles(category) {
  const allMockArticles = {
    Technology: [
      {
        id: 1,
        title: "AI Breakthrough: New Model Outperforms Humans",
        description: "Researchers develop AI system that surpasses human performance in complex reasoning",
        source: "Tech Insider",
        publishedAt: new Date().toISOString(),
        category: "Technology"
      },
      {
        id: 2,
        title: "Quantum Computing Reaches New Milestone",
        description: "Scientists achieve quantum supremacy with 1000-qubit processor",
        source: "Tech Review",
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        category: "Technology"
      },
      {
        id: 3,
        title: "New Smartphone Features Revolutionary Camera Tech",
        description: "Latest flagship phone introduces AI-powered photography capabilities",
        source: "Gadget News",
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        category: "Technology"
      }
    ],
    Business: [
      {
        id: 4,
        title: "Stock Markets Reach All-Time High",
        description: "Major indices surge amid economic optimism and strong earnings",
        source: "Business Daily",
        publishedAt: new Date().toISOString(),
        category: "Business"
      },
      {
        id: 5,
        title: "Tech Giant Announces Major Acquisition",
        description: "Industry leader to acquire startup for $10 billion in strategic move",
        source: "Financial Times",
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        category: "Business"
      },
      {
        id: 6,
        title: "Global Supply Chain Shows Signs of Recovery",
        description: "Shipping costs decline as logistics networks stabilize worldwide",
        source: "Business Week",
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        category: "Business"
      }
    ],
    Science: [
      {
        id: 7,
        title: "NASA Discovers New Earth-Like Planet",
        description: "Scientists find potentially habitable exoplanet 100 light-years away",
        source: "Science Journal",
        publishedAt: new Date().toISOString(),
        category: "Science"
      },
      {
        id: 8,
        title: "Breakthrough in Cancer Research Shows Promise",
        description: "New immunotherapy treatment demonstrates 80% success rate in trials",
        source: "Medical Science Today",
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        category: "Science"
      },
      {
        id: 9,
        title: "Climate Scientists Warn of Tipping Point",
        description: "New research indicates critical climate threshold approaching faster than expected",
        source: "Nature Magazine",
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        category: "Science"
      }
    ],
    Entertainment: [
      {
        id: 10,
        title: "New Blockbuster Movie Breaks Records",
        description: "Latest superhero film becomes highest-grossing opening weekend of all time",
        source: "Entertainment Weekly",
        publishedAt: new Date().toISOString(),
        category: "Entertainment"
      },
      {
        id: 11,
        title: "Music Festival Announces Star-Studded Lineup",
        description: "Biggest names in music confirmed for summer's hottest event",
        source: "Rolling Stone",
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        category: "Entertainment"
      },
      {
        id: 12,
        title: "Streaming Service Reveals Most-Watched Shows",
        description: "Platform shares viewing data revealing surprising audience preferences",
        source: "Variety",
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        category: "Entertainment"
      }
    ],
    Sports: [
      {
        id: 13,
        title: "Championship Game Ends in Historic Victory",
        description: "Underdog team defeats favorites in stunning upset for the ages",
        source: "Sports Network",
        publishedAt: new Date().toISOString(),
        category: "Sports"
      },
      {
        id: 14,
        title: "Olympic Athlete Breaks World Record",
        description: "Track star shatters 20-year-old record in dramatic fashion",
        source: "ESPN",
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        category: "Sports"
      },
      {
        id: 15,
        title: "Major League Team Signs Star Player",
        description: "Franchise announces record-breaking contract with league MVP",
        source: "Sports Illustrated",
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        category: "Sports"
      }
    ]
  };

  if (category === 'All') {
    return Object.values(allMockArticles).flat().slice(0, 15);
  }

  return allMockArticles[category] || allMockArticles.Technology;
}

// Summarize endpoint
app.post('/api/summarize', async (req, res) => {
  try {
    const { article } = req.body;
    
    console.log('Summarizing:', article.title);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockSummary = `
**Article Summary**

**Title:** ${article.title}

**Key Insights:**
• ${article.description}
• Represents significant development in the ${article.category || 'industry'}
• Potential for broader implications and trends
• Could influence future developments

**Overall Analysis:**
This article highlights important developments that demonstrate ongoing innovation and changes in the field, with potential ripple effects across the industry.
    `.trim();
    
    res.json({
      summary: mockSummary,
      model: 'enhanced-mock-v3',
      processingTime: '2.0s'
    });

  } catch (error) {
    console.error('Summary error:', error);
    
    const fallbackSummary = `
**Article Summary**

**Title:** ${req.body.article.title}

**Main Points:**
• ${req.body.article.description}
• Significant development in the industry
• Potential for broader implications

💡 **Summary:**
This news highlights important developments that could influence future trends and industry practices.
    `.trim();
    
    res.json({
      summary: fallbackSummary,
      model: 'fallback-mock',
      processingTime: '1.0s'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: '✅ Backend is running!', 
    timestamp: new Date().toISOString(),
    message: 'Category filtering enabled with NewsAPI',
    categories: Object.keys(categoryMap)
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📰 NewsAPI: Ready with category support`);
  console.log(`🎯 Categories: ${Object.keys(categoryMap).join(', ')}`);
  console.log(`🤖 AI: Using enhanced mock summaries`);
  console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
});