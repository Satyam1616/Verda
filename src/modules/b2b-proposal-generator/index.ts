import { AIService } from '../../lib/ai-service.js';
import logger from '../../lib/logger.js';
import db from '../../lib/db.js';
import { ProposalRequest, B2BProposalOutput } from '../../types/proposal.js';

export class B2BProposalGenerator {
  private aiService: AIService;

  constructor() {
    this.aiService = new AIService();
  }

  async generate(request: ProposalRequest): Promise<B2BProposalOutput> {
    const prompt = `
      As an expert B2B Sustainable Commerce Consultant, generate a customized proposal for ${request.companyName}.
      
      Requirements:
      1. Budget Limit: $${request.budgetLimit}.
      2. Target Audience: ${request.targetAudience || 'General B2B clients'}.
      3. Sustainability Goals: ${request.preferredSustainabilityGoals?.join(', ') || 'General sustainability'}.
      4. Suggest a mix of ${request.numberOfProducts} sustainable products.
      5. Provide a detailed budget allocation (total product cost, logistics cost, and contingency).
      6. Total budget must NOT exceed $${request.budgetLimit}.
      7. Include an impact positioning summary explaining how this proposal meets the client's sustainability goals.
      8. Provide a client-fit explanation.

      Your output must be structured JSON.
    `;

    const responseSchema = {
      type: "object",
      properties: {
        productMix: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              description: { type: "string" },
              quantity: { type: "number" },
              unitCost: { type: "number" },
              sustainabilityScore: { type: "number" }
            },
            required: ["name", "description", "quantity", "unitCost", "sustainabilityScore"]
          }
        },
        budgetAllocation: {
          type: "object",
          properties: {
            totalProductCost: { type: "number" },
            logisticsCost: { type: "number" },
            contingency: { type: "number" },
            totalEstimatedBudget: { type: "number" }
          },
          required: ["totalProductCost", "logisticsCost", "contingency", "totalEstimatedBudget"]
        },
        impactPositioningSummary: { type: "string" },
        clientFitExplanation: { type: "string" }
      },
      required: ["productMix", "budgetAllocation", "impactPositioningSummary", "clientFitExplanation"]
    };

    try {
      logger.info('Generating B2B proposal for client', { companyName: request.companyName });
      const result = await this.aiService.generateStructuredOutput<B2BProposalOutput>(
        prompt,
        responseSchema,
        'B2BProposalGenerator'
      );
      
      // Basic validation: total budget must be within limit
      if (result.budgetAllocation.totalEstimatedBudget > request.budgetLimit) {
        logger.warn('AI suggested budget exceeds limit', { 
          suggested: result.budgetAllocation.totalEstimatedBudget, 
          limit: request.budgetLimit 
        });
      }

      // Store in database
      try {
        const stmt = db.prepare(`
          INSERT INTO proposals (company_name, budget_limit, product_mix, budget_allocation, impact_summary, client_fit)
          VALUES (?, ?, ?, ?, ?, ?)
        `);
        stmt.run(
          request.companyName,
          request.budgetLimit,
          JSON.stringify(result.productMix),
          JSON.stringify(result.budgetAllocation),
          result.impactPositioningSummary,
          result.clientFitExplanation
        );
        logger.info('Proposal stored in database', { companyName: request.companyName });
      } catch (dbErr) {
        logger.error('Failed to store proposal in database', { dbErr });
      }

      return result;
    } catch (error) {
      logger.error('Failed to generate B2B proposal', { error, companyName: request.companyName });
      throw error;
    }
  }
}
