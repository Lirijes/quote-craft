import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Example endpoint for OpenAI
app.post('/api/openai/chat', async (req, res) => {
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', req.body, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Example endpoint for Claude (Anthropic)
app.post('/api/claude/messages', async (req, res) => {
  try {
    const response = await axios.post('https://api.anthropic.com/v1/messages', req.body, {
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Example endpoint for DatoCMS (assuming it's DatoCMS)
app.post('/api/dato/query', async (req, res) => {
  try {
    const response = await axios.post('https://graphql.datocms.com/', req.body, {
      headers: {
        'Authorization': `Bearer ${process.env.DATO_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate quote endpoint
app.post('/api/generate-quote', async (req, res) => {
  const { emailText } = req.body;
  if (!emailText) {
    return res.status(400).json({ error: 'emailText is required' });
  }

  try {
    const prompt = `Analyze this email text and generate a quote structure. Return only valid JSON with the following structure:

{
  "summary": "brief summary of the quote",
  "products": [
    {"name": "product name", "quantity": 1, "price": 100.00}
  ],
  "shipping": 50.00,
  "installation": 200.00,
  "discount": 10.00
}

Email text: ${emailText}`;

    const response = await axios.post('https://api.anthropic.com/v1/messages', {
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    }, {
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      }
    });

    const content = response.data.content[0].text;
    const result = JSON.parse(content);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend server is running' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});