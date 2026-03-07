# Module 3: AI Impact Reporting Generator - Architecture Outline

## Objective

To automate the generation of environmental impact reports for B2B/B2C orders, quantifying the sustainability value of their purchases and providing a human-readable impact statement.

## Requirements Coverage

1. **Estimated Plastic Saved**: Calculated using product material data and weight coefficients (e.g., Plastic Weight vs. Sustainable Alternative Weight).
2. **Carbon Avoided (Logic-based estimation)**: Estimated based on sourcing location (local vs. international) and material lifecycle analysis (LCA) data.
3. **Local Sourcing Impact Summary**: A breakdown of how much of the order was sourced from local artisans or sustainable local manufacturers.
4. **Human-readable Impact Statement**: AI-generated narrative that synthesizes the above metrics into a compelling story for stakeholders.
5. **Database Storage**: All reports are stored in the `OrderImpact` table, linked to the specific Order ID.

## Core Logic & Data Flow

1. **Input**: Order details including products, quantities, and sourcing origins.
2. **Impact Calculation (Business Logic)**:
   - Uses a `SustainabilityMatrix` (lookup table) to assign impact scores to each SKU.
   - Computes: `Total Plastic Saved = Σ (Unit Plastic Saved * Quantity)`.
   - Computes: `Carbon Avoided = Σ (Transportation Carbon Savings + Material Carbon Savings)`.
3. **AI Narrative Generation (AI Logic)**:
   - Prompt: "You are a Sustainability Analyst. Based on these metrics: {plastic: 5.2kg, carbon: 12.5kg, local_sourcing: 75%}, write a 3-sentence impact statement for a corporate client."
4. **Output**: Structured JSON containing both raw metrics and the AI-generated narrative.

## Key Components

- `ImpactEngine`: Core service for deterministic calculations.
- `ImpactAIService`: Interface with LLM for narrative generation.
- `ImpactSchema`: Zod schema ensuring all 4 required fields are present in the final output.

## Prompt Design

"Given the following order metrics:

- Plastic Saved: {plastic_saved}
- Carbon Avoided: {carbon_avoided}
- Local Sourcing: {local_sourcing_percentage}%
  Write a professional, human-readable impact statement that can be shared in a corporate sustainability report."
