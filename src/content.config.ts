import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const articlePath = z.string().regex(/^\/(?:[^/#?\\]+\/)*[^/#?\\]+\.html$/u)
  .refine((path) => !path.split('/').some((segment) => segment === '.' || segment === '..'));

const posts = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/posts',
    generateId: ({ entry }) => entry.normalize('NFC'),
  }),
  schema: z.object({
    title: z.string().trim().min(1),
    publishedAt: z.iso.datetime({ offset: true }),
    categories: z.array(z.string().trim().min(1)).min(1),
    tags: z.array(z.string().trim().min(1)),
    path: articlePath,
    aliases: z.array(articlePath).default([]),
    description: z.string().trim().min(1).optional(),
    author: z.string().trim().min(1).optional(),
  }),
});

export const collections = { posts };
