import { AIService } from '../../lib/ai-service.js';
import logger from '../../lib/logger.js';
import db from '../../lib/db.js';
import { ProductInput, CategoryTagOutput, PREDEFINED_CATEGORIES } from '../../types/product.js';

export class CategoryTagGenerator {
  private aiService: AIService;

  constructor() {
    this.aiService = new AIService();
  }

  async generate(product: ProductInput): Promise<CategoryTagOutput> {
    // ... prompt and schema logic ...
    const prompt = `
      As an expert AI in sustainable commerce, analyze the following product and generate categorization, SEO tags, and sustainability filters.
      
      Product Details:
      Name: ${product.name}
      Description: ${product.description}
      Materials: ${product.materials?.join(', ') || 'N/A'}

      Requirements:
      1. Primary Category must be one of: ${PREDEFINED_CATEGORIES.join(', ')}.
      2. Suggest a specific sub-category.
      3. Generate 5-10 highly relevant SEO tags.
      4. Suggest sustainability filters based on the product's materials and nature (e.g., plastic-free, compostable, vegan, recycled, biodegradable, etc.).

      Your output must be structured JSON.
    `;

    const responseSchema = {
      type: "object",
      properties: {
        primaryCategory: { type: "string" },
        subCategory: { type: "string" },
        seoTags: { 
          type: "array",
          items: { type: "string" }
        },
        sustainabilityFilters: { 
          type: "array",
          items: { type: "string" }
        }
      },
      required: ["primaryCategory", "subCategory", "seoTags", "sustainabilityFilters"]
    };

    try {
      logger.info('Generating category and tags for product', { productName: product.name });
      const result = await this.aiService.generateStructuredOutput<CategoryTagOutput>(
        prompt,
        responseSchema,
        'CategoryTagGenerator'
      );
      
      // Basic validation of primary category
      if (!PREDEFINED_CATEGORIES.includes(result.primaryCategory)) {
        logger.warn('AI suggested category outside predefined list', { category: result.primaryCategory });
      }

      // Store in database
      try {
        const stmt = db.prepare(`
          INSERT INTO products (name, description, primary_category, sub_category, seo_tags, sustainability_filters)
          VALUES (?, ?, ?, ?, ?, ?)
        `);
        stmt.run(
          product.name,
          product.description,
          result.primaryCategory,
          result.subCategory,
          JSON.stringify(result.seoTags),
          JSON.stringify(result.sustainabilityFilters)
        );
        logger.info('Product analysis stored in database', { productName: product.name });
      } catch (dbErr) {
        logger.error('Failed to store product analysis in database', { dbErr });
      }

      return result;
    } catch (error) {
      logger.error('Failed to generate category and tags', { error, productName: product.name });
      throw error;
    }
  }
}
