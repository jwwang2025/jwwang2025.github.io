import { defineCollection, z } from 'astro:content'

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    tags: z.array(z.string()).optional().default([]),
    description: z.string().optional(),
    draft: z.boolean().optional().default(false),
    hidden: z.boolean().optional().default(false),
    published: z.boolean().optional(),
    legacy: z.boolean().optional().default(false),
    categories: z.array(z.string()).optional().default([]),
    readingTime: z.number().int().positive().optional(),
    series: z.string().optional(),
    seriesOrder: z.number().int().positive().optional(),
  }),
})

export const collections = { posts }
