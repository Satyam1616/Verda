import dotenv from 'dotenv';
import logger from './logger.js';
import db from './db.js';

dotenv.config();

/**
 * Groq-backed AI service.
 *
 * Groq exposes an OpenAI-compatible Chat Completions endpoint, so we call it
 * directly with fetch (no SDK dependency). Structured output is enforced via
 * `response_format: json_schema`, with the schema the callers already pass in.
 * If no key is configured, the service transparently falls back to deterministic
 * mock responses so the demo always runs.
 */
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

export class AIService {
  private model: string;
  private apiKey: string | undefined;
  private isMockMode: boolean = false;

  constructor(modelName: string = DEFAULT_MODEL) {
    this.model = modelName;
    const key = process.env.GROQ_API_KEY;
    if (!key || key === 'your_actual_api_key_here' || key.startsWith('MOCK')) {
      logger.warn('Warning: Using mock mode. No valid GROQ_API_KEY found.');
      this.isMockMode = true;
    }
    this.apiKey = key;
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

      const res = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          temperature: 0.4,
          messages: [
            {
              role: 'system',
              content:
                'You are a precise assistant that always replies with a single ' +
                'valid JSON object matching the requested schema. No prose, no markdown.',
            },
            { role: 'user', content: prompt },
          ],
          response_format: {
            type: 'json_schema',
            json_schema: {
              name: context || 'structured_output',
              schema: this.normalizeSchema(responseSchema),
            },
          },
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Groq API ${res.status}: ${errText}`);
      }

      const payload = await res.json();
      const text: string = payload.choices?.[0]?.message?.content ?? '';

      this.logToDb(context, prompt, text);
      logger.info('AI generation successful', { context });
      return JSON.parse(text) as T;
    } catch (error) {
      logger.error('Error in AI generation', { error, context });
      throw new Error(
        `AI generation failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * The modules were written against Gemini's loose schema shape. JSON-Schema
   * (which Groq/OpenAI use) wants `additionalProperties: false` and `required`
   * on objects for strict mode. This recursively hardens the schema so strict
   * structured output succeeds.
   */
  private normalizeSchema(schema: any): any {
    if (!schema || typeof schema !== 'object') return schema;
    const out: any = Array.isArray(schema) ? [] : { ...schema };

    if (out.type === 'object' && out.properties) {
      out.additionalProperties = false;
      if (!out.required) out.required = Object.keys(out.properties);
      for (const k of Object.keys(out.properties)) {
        out.properties[k] = this.normalizeSchema(out.properties[k]);
      }
    }
    if (out.type === 'array' && out.items) {
      out.items = this.normalizeSchema(out.items);
    }
    return out;
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
