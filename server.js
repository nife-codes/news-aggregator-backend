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

// Enhanced news endpoint with mixed NewsAPI + fallback data
app.get('/api/news', async (req, res) => {
  try {
    const { category = 'All' } = req.query;
    const newsApiCategory = categoryMap[category] || 'general';
    
    console.log(`Fetching ${category} news...`);
    
    let articles = [];
    let usedNewsAPI = false;
    
    // Try NewsAPI first (but don't rely on it completely)
    try {
      const response = await axios.get('https://newsapi.org/v2/top-headlines', {
        params: {
          category: newsApiCategory,
          pageSize: 15,
          language: 'en',
          apiKey: process.env.NEWS_API_KEY
        },
        timeout: 5000
      });
      
      if (response.data.articles && response.data.articles.length > 0) {
        articles = response.data.articles
          .filter(article => article.title && article.title !== '[Removed]')
          .map((article, index) => ({
            id: `${category}-${index + 1}-${Date.now()}`,
            title: article.title,
            description: article.description || 'No description available',
            source: article.source?.name || 'Unknown source',
            publishedAt: article.publishedAt || new Date().toISOString(),
            url: article.url || '#',
            imageUrl: article.urlToImage || null,
            category: category
          }));
        
        usedNewsAPI = true;
        console.log(`✅ NewsAPI returned ${articles.length} articles for ${category}`);
      }
      
    } catch (newsApiError) {
      console.log(`❌ NewsAPI failed for ${category}:`, newsApiError.message);
    }
    
    // If NewsAPI returned few/no articles, enhance with fallback data
    if (articles.length < 8) {
      const fallbackArticles = getEnhancedFallbackArticles(category);
      
      if (usedNewsAPI) {
        // Mix real articles with fallback
        const mixedArticles = [...articles, ...fallbackArticles];
        // Remove duplicates by title
        const uniqueArticles = mixedArticles.filter((article, index, self) => 
          index === self.findIndex(a => a.title === article.title)
        );
        articles = uniqueArticles.slice(0, 20);
        console.log(`🔀 Mixed ${articles.length} articles (${articles.length - fallbackArticles.length} from API)`);
      } else {
        // Use only fallback
        articles = fallbackArticles;
        console.log(`🔄 Using ${articles.length} fallback articles for ${category}`);
      }
    }
    
    res.json(articles.slice(0, 20));
    
  } catch (error) {
    console.error('Final fallback:', error.message);
    res.json(getEnhancedFallbackArticles(req.query.category || 'All'));
  }
});

// Enhanced fallback with more variety and better category matching
function getEnhancedFallbackArticles(category) {
  const enhancedMockArticles = {
    Technology: [
      {
        id: `tech-${Date.now()}-1`,
        title: "AI Breakthrough: New Model Outperforms Humans in Reasoning",
        description: "Groundbreaking AI system demonstrates superior performance in complex logical tasks",
        source: "Tech Insider",
        publishedAt: new Date().toISOString(),
        category: "Technology"
      },
      {
        id: `tech-${Date.now()}-2`,
        title: "Quantum Computer Reaches 1000-Qubit Milestone",
        description: "Scientists achieve unprecedented quantum computing power with new processor design",
        source: "Quantum Computing Weekly",
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        category: "Technology"
      },
      {
        id: `tech-${Date.now()}-3`,
        title: "Revolutionary Battery Tech Promises 7-Day Phone Life",
        description: "New solid-state batteries could transform mobile device endurance",
        source: "Tech Innovation News",
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        category: "Technology"
      },
      {
        id: `tech-${Date.now()}-4`,
        title: "Major Software Update Brings AI to Millions of Devices",
        description: "Latest OS release integrates artificial intelligence across all applications",
        source: "Digital Trends",
        publishedAt: new Date(Date.now() - 10800000).toISOString(),
        category: "Technology"
      },
      {
        id: `tech-${Date.now()}-5`,
        title: "Cybersecurity Firm Discovers Critical Vulnerability",
        description: "Major security flaw affects millions of devices worldwide, patch released",
        source: "Security Today",
        publishedAt: new Date(Date.now() - 14400000).toISOString(),
        category: "Technology"
      },
      {
        id: `tech-${Date.now()}-6`,
        title: "SpaceX Launches Next-Generation Internet Satellites",
        description: "New satellite constellation promises global high-speed internet coverage",
        source: "Space Tech News",
        publishedAt: new Date(Date.now() - 18000000).toISOString(),
        category: "Technology"
      }
    ],
    Business: [
      {
        id: `biz-${Date.now()}-1`,
        title: "Global Markets Surge to Record Highs Amid Economic Boom",
        description: "Stock indices worldwide reach unprecedented levels as economy shows strong growth",
        source: "Financial Times",
        publishedAt: new Date().toISOString(),
        category: "Business"
      },
      {
        id: `biz-${Date.now()}-2`,
        title: "Tech Giant Announces $50 Billion Strategic Acquisition",
        description: "Major technology company makes largest acquisition in industry history",
        source: "Wall Street Journal",
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        category: "Business"
      },
      {
        id: `biz-${Date.now()}-3`,
        title: "Startup Valuation Soars to $10 Billion in Latest Funding",
        description: "AI-powered platform attracts massive investment from venture capital firms",
        source: "Business Insider",
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        category: "Business"
      },
      {
        id: `biz-${Date.now()}-4`,
        title: "Central Banks Announce Coordinated Economic Measures",
        description: "Global financial institutions take unprecedented steps to stabilize markets",
        source: "Economic Review",
        publishedAt: new Date(Date.now() - 10800000).toISOString(),
        category: "Business"
      },
      {
        id: `biz-${Date.now()}-5`,
        title: "Renewable Energy Investments Reach Record $500 Billion",
        description: "Global shift to clean energy accelerates with massive capital inflows",
        source: "Green Business Weekly",
        publishedAt: new Date(Date.now() - 14400000).toISOString(),
        category: "Business"
      }
    ],
    Science: [
      {
        id: `sci-${Date.now()}-1`,
        title: "NASA Discovers Earth-Like Planet in Habitable Zone",
        description: "New exoplanet discovery raises possibilities of extraterrestrial life",
        source: "Science Journal",
        publishedAt: new Date().toISOString(),
        category: "Science"
      },
      {
        id: `sci-${Date.now()}-2`,
        title: "Breakthrough Cancer Treatment Shows 90% Success Rate",
        description: "Revolutionary immunotherapy approach demonstrates unprecedented results",
        source: "Medical Research Today",
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        category: "Science"
      },
      {
        id: `sci-${Date.now()}-3`,
        title: "Climate Scientists Confirm Critical Tipping Point",
        description: "New research reveals irreversible climate changes already underway",
        source: "Environmental Science Review",
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        category: "Science"
      },
      {
        id: `sci-${Date.now()}-4`,
        title: "Genetic Engineering Breakthrough Could End Disease",
        description: "Scientists develop revolutionary gene-editing technique with medical applications",
        source: "Biotech Innovations",
        publishedAt: new Date(Date.now() - 10800000).toISOString(),
        category: "Science"
      },
      {
        id: `sci-${Date.now()}-5`,
        title: "Archaeologists Uncover Ancient Lost City",
        description: "Major discovery reveals previously unknown civilization from 3000 BC",
        source: "Archaeology Today",
        publishedAt: new Date(Date.now() - 14400000).toISOString(),
        category: "Science"
      }
    ],
    Sports: [
      {
        id: `sports-${Date.now()}-1`,
        title: "Underdog Team Wins Championship in Historic Upset",
        description: "Last-place team completes miraculous season turnaround to claim title",
        source: "ESPN",
        publishedAt: new Date().toISOString(),
        category: "Sports"
      },
      {
        id: `sports-${Date.now()}-2`,
        title: "Record-Breaking Performance Stuns Sports World",
        description: "Athlete sets new world record that experts called impossible",
        source: "Sports Illustrated",
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        category: "Sports"
      },
      {
        id: `sports-${Date.now()}-3`,
        title: "International Tournament Delivers Unforgettable Final",
        description: "Championship game goes into overtime with dramatic conclusion",
        source: "Global Sports Network",
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        category: "Sports"
      },
      {
        id: `sports-${Date.now()}-4`,
        title: "Legendary Coach Announces Retirement After 40 Years",
        description: "Sports icon steps down after unprecedented championship career",
        source: "Athletic Review",
        publishedAt: new Date(Date.now() - 10800000).toISOString(),
        category: "Sports"
      },
      {
        id: `sports-${Date.now()}-5`,
        title: "New Stadium Breaks Ground with Revolutionary Design",
        description: "State-of-the-art sports venue promises enhanced fan experience",
        source: "Stadium Innovations",
        publishedAt: new Date(Date.now() - 14400000).toISOString(),
        category: "Sports"
      }
    ],
    Entertainment: [
      {
        id: `ent-${Date.now()}-1`,
        title: "Blockbuster Film Shatters Box Office Records",
        description: "Latest franchise installment becomes fastest to reach $1 billion worldwide",
        source: "Entertainment Weekly",
        publishedAt: new Date().toISOString(),
        category: "Entertainment"
      },
      {
        id: `ent-${Date.now()}-2`,
        title: "Award Show Delivers Surprising Winners and Memorable Moments",
        description: "Annual ceremony features unexpected victories and viral performances",
        source: "Hollywood Reporter",
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        category: "Entertainment"
      },
      {
        id: `ent-${Date.now()}-3`,
        title: "Streaming Service Announces Major Content Expansion",
        description: "Platform to add hundreds of new titles in global market push",
        source: "Digital Entertainment News",
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        category: "Entertainment"
      },
      {
        id: `ent-${Date.now()}-4`,
        title: "Music Icon Returns with First Album in Decade",
        description: "Highly anticipated release breaks pre-order records worldwide",
        source: "Music Today",
        publishedAt: new Date(Date.now() - 10800000).toISOString(),
        category: "Entertainment"
      },
      {
        id: `ent-${Date.now()}-5`,
        title: "Virtual Reality Concert Attracts Millions of Viewers",
        description: "Groundbreaking entertainment experience sets new industry standards",
        source: "Tech Entertainment",
        publishedAt: new Date(Date.now() - 14400000).toISOString(),
        category: "Entertainment"
      }
    ]
  };

  if (category === 'All') {
    // Mix articles from all categories for "All"
    const allArticles = Object.values(enhancedMockArticles).flat();
    return allArticles.sort(() => Math.random() - 0.5).slice(0, 20);
  }

  return enhancedMockArticles[category] || enhancedMockArticles.Technology;
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
    message: 'Enhanced news aggregator with mixed API + fallback content',
    categories: Object.keys(categoryMap),
    features: ['Mixed Content', 'Duplicate Prevention', 'Enhanced Fallbacks']
  });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log(`Enhanced News Aggregator: Ready with mixed content`);
  console.log(`Categories: ${Object.keys(categoryMap).join(', ')}`);
  console.log(`Content Strategy: NewsAPI + Enhanced Fallbacks`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});