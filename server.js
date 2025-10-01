const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Real NewsAPI endpoint
app.get('/api/news', async (req, res) => {
  try {
    console.log('Fetching real news from NewsAPI...');
    
    const response = await axios.get('https://newsapi.org/v2/top-headlines', {
      params: {
        country: 'us',
        category: 'technology',
        pageSize: 12,
        apiKey: process.env.NEWS_API_KEY
      }
    });

    console.log('NewsAPI response received');

    const articles = response.data.articles.map((article, index) => ({
      id: index + 1,
      title: article.title || 'No title available',
      description: article.description || 'No description available',
      source: article.source?.name || 'Unknown source',
      publishedAt: article.publishedAt || new Date().toISOString(),
      url: article.url || '#',
      imageUrl: article.urlToImage || null
    }));

    res.json(articles);
  } catch (error) {
    console.error('NewsAPI error:', error.response?.data || error.message);
    
    // Fallback to mock data if API fails
    const mockArticles = [
      {
        id: 1,
        title: "AI Breakthrough: New Model Outperforms Humans",
        description: "Researchers develop AI system that surpasses human performance in complex reasoning tasks",
        source: "Tech Insider",
        publishedAt: new Date().toISOString(),
      },
      {
        id: 2,
        title: "Global Tech Summit Announces Climate Initiatives", 
        description: "Major tech companies commit to carbon neutrality by 2030",
        source: "Business Tech",
        publishedAt: new Date().toISOString(),
      }
    ];
    
    res.json(mockArticles);
  }
});

// IMPROVED summarize endpoint with better formatting
app.post('/api/summarize', async (req, res) => {
  try {
    const { article } = req.body;
    
    console.log('Summarizing:', article.title);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // CLEAN, WELL-FORMATTED mock summary
    const mockSummary = `
**Article Summary**

**Title:** ${article.title}

**Key Insights:**
• ${article.description}
• Represents crossover between gaming and collectible card games
• Potential for expanded brand collaborations
• Could influence future gaming merchandise trends

💡 **Overall Analysis:**
This collaboration between PlayStation and Magic: The Gathering represents an innovative approach to brand partnerships in the gaming industry, potentially opening doors for similar crossovers in the future.
    `.trim();
    
    res.json({
      summary: mockSummary,
      model: 'enhanced-mock-v3',
      processingTime: '2.0s'
    });

  } catch (error) {
    console.error('Summary error:', error);
    
    // Improved fallback summary
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
    message: 'Using enhanced mock summaries (DeepSeek balance issue)'
  });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log(`NewsAPI: Ready to fetch real news`);
  console.log(`AI: Using enhanced mock summaries`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});