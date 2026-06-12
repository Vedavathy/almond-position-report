import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const reports = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/reports' }),
  schema: z.object({
    title: z.string(),
    month: z.string(),
    year: z.number(),
    cropYear: z.string(),
    releaseDate: z.string(),
    generatedAt: z.string(),
    dataMonth: z.string(),
  }),
});

export const collections = { reports };
