import { CategoryTagGenerator } from './modules/category-tag-generator';
import { B2BProposalGenerator } from './modules/b2b-proposal-generator';
import logger from './lib/logger';
import dotenv from 'dotenv';

dotenv.config();

async function runDemo() {
  logger.info('Starting Rayeva AI Modules Demo');

  // --- Module 1: AI Auto-Category & Tag Generator ---
  const categoryGenerator = new CategoryTagGenerator();
  const sampleProduct = {
    name: "Bamboo Bento Box",
    description: "Eco-friendly, reusable lunch container made from sustainably sourced bamboo with a silicone seal for leak-proof storage.",
    materials: ["Bamboo", "Silicone", "Cotton Strap"]
  };

  try {
    const categoryResult = await categoryGenerator.generate(sampleProduct);
    console.log('--- Module 1 Result (Category & Tags) ---');
    console.log(JSON.stringify(categoryResult, null, 2));
  } catch (err) {
    logger.error('Error in Module 1 demo', { err });
  }

  // --- Module 2: AI B2B Proposal Generator ---
  const proposalGenerator = new B2BProposalGenerator();
  const sampleProposalRequest = {
    companyName: "GreenTech Solutions",
    budgetLimit: 5000,
    targetAudience: "Corporate employees for employee gifting",
    preferredSustainabilityGoals: ["Plastic-free", "Carbon-neutral"],
    numberOfProducts: 3
  };

  try {
    const proposalResult = await proposalGenerator.generate(sampleProposalRequest);
    console.log('\n--- Module 2 Result (B2B Proposal) ---');
    console.log(JSON.stringify(proposalResult, null, 2));
  } catch (err) {
    logger.error('Error in Module 2 demo', { err });
  }

  logger.info('Demo completed.');
}

// Run the demo
runDemo().catch(err => {
  logger.error('Unhandled error in demo', { err });
});
