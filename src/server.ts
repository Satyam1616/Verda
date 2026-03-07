import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { CategoryTagGenerator } from './modules/category-tag-generator/index.js';
import { B2BProposalGenerator } from './modules/b2b-proposal-generator/index.js';
import logger from './lib/logger.js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const categoryGenerator = new CategoryTagGenerator();
const proposalGenerator = new B2BProposalGenerator();

// --- API Endpoints ---

// Module 1: AI Auto-Category & Tag Generator
app.post('/api/generate-tags', async (req, res) => {
  try {
    const { name, description, materials } = req.body;
    if (!name || !description) {
      return res.status(400).json({ error: 'Name and description are required' });
    }
    
    const result = await categoryGenerator.generate({ name, description, materials });
    res.json(result);
  } catch (error: any) {
    logger.error('API Error: /api/generate-tags', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// Module 2: AI B2B Proposal Generator
app.post('/api/generate-proposal', async (req, res) => {
  try {
    const { companyName, budgetLimit, targetAudience, preferredSustainabilityGoals, numberOfProducts } = req.body;
    if (!companyName || !budgetLimit) {
      return res.status(400).json({ error: 'Company name and budget limit are required' });
    }

    const result = await proposalGenerator.generate({
      companyName,
      budgetLimit: Number(budgetLimit),
      targetAudience,
      preferredSustainabilityGoals,
      numberOfProducts: Number(numberOfProducts || 5)
    });
    res.json(result);
  } catch (error: any) {
    logger.error('API Error: /api/generate-proposal', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// Module 3: AI Impact Reporting (Mock/Simulation for Demo)
app.post('/api/generate-impact', async (req, res) => {
  try {
    const { orderId, orderDetails } = req.body;
    // Simulate complex calculation logic
    const result = {
      plasticSaved: "12.5 kg",
      carbonAvoided: "45.2 kg",
      localSourcing: "85%",
      impactStatement: "By choosing sustainable alternatives for order " + orderId + ", you've effectively removed the equivalent of 600 plastic bottles from the ecosystem and supported local artisans in the Karnataka region."
    };
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Module 4: AI WhatsApp Bot (Simulation for Demo)
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const lowerMsg = message.toLowerCase();
    
    let response = "";
    let reasoning = "";
    let escalate = false;

    if (lowerMsg.includes('status') || lowerMsg.includes('order')) {
      reasoning = "Intent: Order Query. Action: DB Lookup for #ORD-8821.";
      response = "Your order #ORD-8821 is currently 'In Transit' and is expected to arrive by Tuesday, March 10th. Tracking: RYV-99210.";
    } else if (lowerMsg.includes('return') || lowerMsg.includes('refund')) {
      reasoning = "Intent: Policy Query. Sentiment: Neutral. Action: RAG Lookup.";
      response = "Our return policy allows for returns within 30 days of delivery. For sustainable items, we offer free carbon-neutral return shipping.";
      if (lowerMsg.includes('refund')) escalate = true;
    } else {
      reasoning = "Intent: General FAQ. Action: Generative Response.";
      response = "I'm here to help with your sustainable commerce journey! You can ask about your orders, our impact metrics, or how we source our bamboo products.";
    }

    res.json({ response, reasoning, escalate });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  logger.info(`Rayeva AI Server running at http://localhost:${port}`);
});
