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

// Real news endpoint with proper category mapping AND DUPLICATE REMOVAL
app.get('/api/news', async (req, res) => {
  try {
    const { category = 'All' } = req.query;
    
    // Map frontend category to NewsAPI category
    const newsApiCategory = categoryMap[category] || 'general';
    
    console.log(`Fetching news - Frontend: "${category}" → NewsAPI: "${newsApiCategory}"`);
    
    const response = await axios.get('https://newsapi.org/v2/top-headlines', {
  params: {
    category: newsApiCategory,
    pageSize: 30,
    language: 'en',
    apiKey: process.env.NEWS_API_KEY
  }
    });

    console.log(`NewsAPI response: ${response.data.articles.length} articles for ${category}`);

    // REMOVE DUPLICATES by title and filter out bad articles
    const seenTitles = new Set();
    const articles = response.data.articles
      .filter(article => {
        // Filter out bad articles and duplicates
        const hasTitle = article.title && article.title !== '[Removed]';
        const isDuplicate = seenTitles.has(article.title);
        
        if (hasTitle && !isDuplicate) {
          seenTitles.add(article.title);
          return true;
        }
        return false;
      })
      .map((article, index) => ({
        id: `${category}-${index + 1}-${Date.now()}`, // Unique ID per category
        title: article.title,
        description: article.description || 'No description available',
        source: article.source?.name || 'Unknown source',
        publishedAt: article.publishedAt || new Date().toISOString(),
        url: article.url || '#',
        imageUrl: article.urlToImage || null,
        category: category
      }))
      .slice(0, 20); // Limit to 20 articles

    console.log(`After filtering: ${articles.length} unique articles`);

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
        id: `tech-${Date.now()}-1`,
        title: "AI Breakthrough: New Model Outperforms Humans",
        description: "Researchers develop AI system that surpasses human performance in complex reasoning",
        source: "Tech Insider",
        publishedAt: new Date().toISOString(),
        category: "Technology"
      },
      {
        id: `tech-${Date.now()}-2`,
        title: "Quantum Computing Reaches New Milestone",
        description: "Scientists achieve quantum supremacy with 1000-qubit processor",
        source: "Tech Review",
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        category: "Technology"
      },
      {
        id: `tech-${Date.now()}-3`,
        title: "New Smartphone Features Revolutionary Camera Tech",
        description: "Latest flagship phone introduces AI-powered photography capabilities",
        source: "Gadget News",
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        category: "Technology"
      }
    ],
    Business: [
      {
        id: `biz-${Date.now()}-1`,
        title: "Stock Markets Reach All-Time High",
        description: "Major indices surge amid economic optimism and strong earnings",
        source: "Business Daily",
        publishedAt: new Date().toISOString(),
        category: "Business"
      },
      {
        id: `biz-${Date.now()}-2`,
        title: "Tech Giant Announces Major Acquisition",
        description: "Industry leader to acquire startup for $10 billion in strategic move",
        source: "Financial Times",
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        category: "Business"
      }
    ],
    Science: [
      {
        id: `sci-${Date.now()}-1`,
        title: "NASA Discovers New Earth-Like Planet",
        description: "Scientists find potentially habitable exoplanet 100 light-years away",
        source: "Science Journal",
        publishedAt: new Date().toISOString(),
        category: "Science"
      },
      {
        id: `sci-${Date.now()}-2`,
        title: "Breakthrough in Cancer Research Shows Promise",
        description: "New immunotherapy treatment demonstrates 80% success rate in trials",
        source: "Medical Science Today",
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        category: "Science"
      }
    ],
    Entertainment: [
      {
        id: `ent-${Date.now()}-1`,
        title: "New Blockbuster Movie Breaks Records",
        description: "Latest superhero film becomes highest-grossing opening weekend of all time",
        source: "Entertainment Weekly",
        publishedAt: new Date().toISOString(),
        category: "Entertainment"
      }
    ],
    Sports: [
      {
        id: `sports-${Date.now()}-1`,
        title: "Championship Game Ends in Historic Victory",
        description: "Underdog team defeats favorites in stunning upset for the ages",
        source: "Sports Network",
        publishedAt: new Date().toISOString(),
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

**Summary:**
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
    message: 'Category filtering enabled with NewsAPI + Duplicate Prevention',
    categories: Object.keys(categoryMap),
    features: ['Duplicate Prevention', 'Category Mapping', 'Enhanced Mock Summaries']
  });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log(`NewsAPI: Ready with category support`);
  console.log(`Categories: ${Object.keys(categoryMap).join(', ')}`);
  console.log(`Duplicate Prevention: ACTIVE`);
  console.log(`AI: Using enhanced mock summaries`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});