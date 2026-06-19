import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * The schemas below are HALF of a two-part contract: keystatic.config.ts must
 * stay in lockstep with these Zod schemas, since both describe the same files.
 * A mismatch fails the build with InvalidContentEntryFrontmatter. See CLAUDE.md.
 *
 * Images are stored as plain co-located FILENAMES (e.g. "cover.jpg") and resolved
 * to optimizable ImageMetadata at render time via src/lib/images.ts. This keeps
 * the folder-per-entry archive self-contained and sidesteps the Keystatic <-> the
 * astro `image()` helper relative-path friction, while still getting astro:assets
 * optimization (AVIF/WebP, responsive srcset).
 */

// Keystatic writes empty optional fields as null or "" — normalize those to
// "absent" so plain .optional() Zod fields don't reject them.
const opt = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((v) => (v === null || v === '' ? undefined : v), schema.optional());

// A gallery item is either a co-located image or an embedded provider video.
const galleryItem = z.object({
  type: z.enum(['image', 'video']),
  src: opt(z.string()), // co-located filename, e.g. "gallery-1.jpg"
  alt: opt(z.string()),
  provider: opt(z.enum(['youtube', 'vimeo'])),
  videoId: opt(z.string()),
  caption: opt(z.string()),
});

const works = defineCollection({
  loader: glob({ pattern: '**/index.mdoc', base: './src/content/works' }),
  schema: z.object({
    title: z.string(),
    year: z.coerce.number(),
    shortDescription: z.string(), // explicit field — NOT parsed from a heading
    cover: z.string(), // co-located filename, resolved via lib/images.ts
    coverAlt: z.string().min(1, { error: 'Cover alt text is required.' }),
    gallery: z.array(galleryItem).default([]),
    artists: z.array(z.string()).default([]),
    medium: z.array(z.string()).default([]),
    featured: z.boolean().default(false), // homepage selection
    order: opt(z.coerce.number()), // manual ordering of featured works
    draft: z.boolean().default(false),
  }),
});

const events = defineCollection({
  loader: glob({ pattern: '**/index.mdoc', base: './src/content/events' }),
  schema: z.object({
    title: z.string(),
    startDate: z.coerce.date(),
    endDate: opt(z.coerce.date()), // multi-day runs: counts as "current" until endDate
    kind: z.enum(['music', 'exhibition', 'both']).default('exhibition'),
    venue: z.string(),
    city: opt(z.string()),
    shortDescription: z.string(),
    // SINGLE source of truth for the works <-> events relationship.
    relevantWorks: z.array(reference('works')).default([]),
    poster: opt(z.string()),
    posterAlt: opt(z.string()),
    artists: z.array(z.string()).default([]),
    ticketUrl: opt(z.url()),
    draft: z.boolean().default(false),
  }),
});

const commissions = defineCollection({
  loader: glob({ pattern: '**/index.mdoc', base: './src/content/commissions' }),
  schema: z.object({
    title: z.string(),
    client: z.string(),
    year: z.coerce.number(),
    shortDescription: z.string(),
    cover: z.string(),
    coverAlt: z.string().min(1, { error: 'Cover alt text is required.' }),
    gallery: z.array(galleryItem).default([]),
    relevantWorks: z.array(reference('works')).default([]), // optional cross-link
    featured: z.boolean().default(false),
    order: opt(z.coerce.number()),
    draft: z.boolean().default(false),
  }),
});

// Global site settings — a Keystatic singleton stored as a body-less YAML file.
const settings = defineCollection({
  loader: glob({ pattern: 'site.yaml', base: './src/content/settings' }),
  schema: z.object({
    heroHeadline: z.string(),
    heroTagline: opt(z.string()),
    heroPoster: z.string(), // co-located filename in src/content/settings/
    heroPosterAlt: z.string().min(1, { error: 'Hero poster alt text is required.' }),
    heroVideoSrc: opt(z.string()), // optional self-hosted loop in public/ (mp4)
    heroVideoWebm: opt(z.string()), // optional webm source in public/
    contactEmail: opt(z.email()),
    contactText: opt(z.string()),
    socials: z
      .array(z.object({ label: z.string(), url: z.url() }))
      .default([]),
  }),
});

// "About" page — a Keystatic singleton with a Markdoc body (Keystatic-owned rich text).
const about = defineCollection({
  loader: glob({ pattern: 'index.mdoc', base: './src/content/about' }),
  schema: z.object({
    title: z.string().default('About'),
    intro: opt(z.string()),
  }),
});

export const collections = { works, events, commissions, settings, about };
