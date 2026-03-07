import { z } from 'zod';

export const ProposalRequestSchema = z.object({
  companyName: z.string(),
  budgetLimit: z.number().positive(),
  targetAudience: z.string().optional(),
  preferredSustainabilityGoals: z.array(z.string()).optional(),
  numberOfProducts: z.number().default(5),
});

export type ProposalRequest = z.infer<typeof ProposalRequestSchema>;

export const B2BProposalOutputSchema = z.object({
  productMix: z.array(z.object({
    name: z.string(),
    description: z.string(),
    quantity: z.number(),
    unitCost: z.number(),
    sustainabilityScore: z.number().min(1).max(10),
  })),
  budgetAllocation: z.object({
    totalProductCost: z.number(),
    logisticsCost: z.number(),
    contingency: z.number(),
    totalEstimatedBudget: z.number(),
  }),
  impactPositioningSummary: z.string(),
  clientFitExplanation: z.string(),
});

export type B2BProposalOutput = z.infer<typeof B2BProposalOutputSchema>;
