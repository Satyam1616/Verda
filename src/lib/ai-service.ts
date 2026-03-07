import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import dotenv from 'dotenv';
import logger from './logger.js';
import db from './db.js';

dotenv.config();

const apiKey = process.env.GOOGLE_API_KEY || 'MOCK_API_KEY';
const genAI = new GoogleGenerativeAI(apiKey);

export class AIService {
  private model: any;
  private isMockMode: boolean = false;

  constructor(modelName: string = 'gemini-flash-latest') {
    const key = process.env.GOOGLE_API_KEY;
    if (!key || key === 'your_actual_api_key_here' || key.startsWith('MOCK')) {
      logger.warn('Warning: Using mock mode. No valid Google API key found.');
      this.isMockMode = true;
    }
    this.model = genAI.getGenerativeModel({ model: modelName });
  }

  private logToDb(context: string, prompt: string, response: string) {
    try {
      const stmt = db.prepare('INSERT INTO ai_logs (context, prompt, response) VALUES (?, ?, ?)');
      stmt.run(context, prompt, response);
    } catch (err) {
      logger.error('Failed to log AI transaction to database', { err });
    }
  }

  async generateStructuredOutput<T>(
    prompt: string,
    responseSchema: any,
    context: string = ''
  ): Promise<T> {
    if (this.isMockMode) {
      logger.info('Returning mock AI response', { context });
      const mockRes = this.getMockResponse(context);
      this.logToDb(context, prompt, JSON.stringify(mockRes));
      return mockRes as T;
    }

    try {
      logger.info('Starting AI generation', { context, promptLength: prompt.length });
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: responseSchema,
        },
      });

      const response = result.response;
      const text = response.text();
      
      this.logToDb(context, prompt, text);
      logger.info('AI generation successful', { context });
      return JSON.parse(text) as T;
    } catch (error) {
      logger.error('Error in AI generation', { error, context });
      throw new Error(`AI generation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private getMockResponse(context: string): any {
    if (context === 'CategoryTagGenerator') {
      return {
        primaryCategory: 'Tableware',
        subCategory: 'Lunch Boxes',
        seoTags: ['eco-friendly', 'bamboo', 'bento box', 'reusable', 'sustainable kitchen'],
        sustainabilityFilters: ['plastic-free', 'compostable', 'biodegradable']
      };
    }
    
    if (context === 'B2BProposalGenerator') {
      return {
        productMix: [
          { name: 'Bamboo Cutlery Set', description: 'Portable reusable cutlery', quantity: 100, unitCost: 5, sustainabilityScore: 9 },
          { name: 'Jute Tote Bags', description: 'Durable eco-friendly bags', quantity: 200, unitCost: 3, sustainabilityScore: 8 }
        ],
        budgetAllocation: {
          totalProductCost: 1100,
          logisticsCost: 150,
          contingency: 50,
          totalEstimatedBudget: 1300
        },
        impactPositioningSummary: 'This proposal focuses on reducing single-use plastic waste for your employees.',
        clientFitExplanation: 'Perfect for corporate gifting with a strong environmental message.'
      };
    }

    return {};
  }
}

export const aiService = new AIService();
