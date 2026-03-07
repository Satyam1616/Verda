import { z } from 'zod';

export const ProductInputSchema = z.object({
  name: z.string(),
  description: z.string(),
  materials: z.array(z.string()).optional(),
});

export type ProductInput = z.infer<typeof ProductInputSchema>;

export const CategoryTagOutputSchema = z.object({
  primaryCategory: z.string(),
  subCategory: z.string(),
  seoTags: z.array(z.string()),
  sustainabilityFilters: z.array(z.string()),
});

export type CategoryTagOutput = z.infer<typeof CategoryTagOutputSchema>;

export const PREDEFINED_CATEGORIES = [
  'Packaging',
  'Tableware',
  'Stationery',
  'Home Decor',
  'Fashion Accessories',
  'Personal Care',
  'Gifting',
  'Office Supplies',
];
