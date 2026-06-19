import { config, collection, singleton, fields } from '@keystatic/core';

/**
 * Keystatic CMS config — the editing UI half of the content contract.
 * MUST stay in lockstep with src/content.config.ts (same files, two schemas).
 *
 * Storage is LOCAL: the /keystatic admin only runs on the local dev server
 * (`npm run dev`). Workflow is git: pull -> edit -> push. Cloudflare builds the
 * static site on push; nothing server-side ships to production.
 *
 * Authoring model is KEYSTATIC-FIRST: bodies are Markdoc rich text edited here.
 * Do NOT hand-edit bodies in Obsidian and re-save them in Keystatic — the editor
 * normalizes/strips non-Markdoc syntax. Cross-links use the relationship field
 * (below) and standard [label](/works/slug) Markdown links, not [[wikilinks]].
 */

// Reusable gallery field: a flat array where each item is an image OR a video
// embed. Kept flat (not fields.conditional) so it serializes to the simple shape
// the Astro galleryItem schema expects.
const gallery = fields.array(
  fields.object({
    type: fields.select({
      label: 'Type',
      options: [
        { label: 'Image', value: 'image' },
        { label: 'Video embed', value: 'video' },
      ],
      defaultValue: 'image',
    }),
    src: fields.image({
      label: 'Image (for Image items)',
      description: 'Used when Type = Image. Stored next to the entry.',
      // no `directory` => co-located with the entry; value is just the filename.
    }),
    alt: fields.text({ label: 'Alt text (for Image items)' }),
    provider: fields.select({
      label: 'Provider (for Video items)',
      options: [
        { label: 'YouTube', value: 'youtube' },
        { label: 'Vimeo', value: 'vimeo' },
      ],
      defaultValue: 'youtube',
    }),
    videoId: fields.text({
      label: 'Video ID (for Video items)',
      description: 'e.g. the part after watch?v= (YouTube) or vimeo.com/ (Vimeo).',
    }),
    caption: fields.text({ label: 'Caption (optional)' }),
  }),
  {
    label: 'Gallery',
    itemLabel: (p) =>
      `${p.fields.type.value}${p.fields.caption.value ? ` — ${p.fields.caption.value}` : ''}`,
  }
);

const relevantWorks = fields.array(
  fields.relationship({ label: 'Work', collection: 'works' }),
  {
    label: 'Relevant works',
    description: 'Pick works shown / related. The work pages list this automatically.',
    itemLabel: (p) => p.value ?? 'Work',
  }
);

export default config({
  storage: { kind: 'local' },
  ui: {
    brand: { name: 'ShadowWorks' },
    navigation: {
      Content: ['works', 'events', 'commissions'],
      Pages: ['about'],
      Settings: ['settings'],
    },
  },
  collections: {
    works: collection({
      label: 'Works',
      slugField: 'title',
      path: 'src/content/works/*/',
      format: { contentField: 'body' },
      columns: ['title', 'year'],
      entryLayout: 'content',
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        year: fields.integer({ label: 'Year', validation: { isRequired: true } }),
        shortDescription: fields.text({
          label: 'Short description',
          description: 'One or two lines, shown on cards and as the meta description.',
          multiline: true,
          validation: { length: { min: 1 } },
        }),
        cover: fields.image({
          label: 'Cover image',
          validation: { isRequired: true },
        }),
        coverAlt: fields.text({
          label: 'Cover alt text',
          validation: { length: { min: 1 } },
        }),
        gallery,
        artists: fields.array(fields.text({ label: 'Artist' }), {
          label: 'Artists',
          itemLabel: (p) => p.value,
        }),
        medium: fields.array(fields.text({ label: 'Medium / tag' }), {
          label: 'Medium',
          itemLabel: (p) => p.value,
        }),
        featured: fields.checkbox({ label: 'Featured on home page' }),
        order: fields.integer({ label: 'Featured order (optional)' }),
        draft: fields.checkbox({ label: 'Draft (hidden from production)' }),
        body: fields.markdoc({ label: 'Description' }),
      },
    }),

    events: collection({
      label: 'Events',
      slugField: 'title',
      path: 'src/content/events/*/',
      format: { contentField: 'body' },
      columns: ['title', 'startDate'],
      entryLayout: 'content',
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        startDate: fields.date({ label: 'Start date', validation: { isRequired: true } }),
        endDate: fields.date({ label: 'End date (optional, for multi-day runs)' }),
        kind: fields.select({
          label: 'Kind',
          options: [
            { label: 'Music', value: 'music' },
            { label: 'Exhibition', value: 'exhibition' },
            { label: 'Both', value: 'both' },
          ],
          defaultValue: 'exhibition',
        }),
        venue: fields.text({ label: 'Venue', validation: { length: { min: 1 } } }),
        city: fields.text({ label: 'City (optional)' }),
        shortDescription: fields.text({
          label: 'Short description',
          multiline: true,
          validation: { length: { min: 1 } },
        }),
        relevantWorks,
        poster: fields.image({ label: 'Poster (optional)' }),
        posterAlt: fields.text({ label: 'Poster alt text (if poster set)' }),
        artists: fields.array(fields.text({ label: 'Artist' }), {
          label: 'Artists',
          itemLabel: (p) => p.value,
        }),
        ticketUrl: fields.url({ label: 'Ticket / RSVP link (optional)' }),
        draft: fields.checkbox({ label: 'Draft (hidden from production)' }),
        body: fields.markdoc({ label: 'Details' }),
      },
    }),

    commissions: collection({
      label: 'Commissions',
      slugField: 'title',
      path: 'src/content/commissions/*/',
      format: { contentField: 'body' },
      columns: ['title', 'client', 'year'],
      entryLayout: 'content',
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        client: fields.text({ label: 'Client', validation: { length: { min: 1 } } }),
        year: fields.integer({ label: 'Year', validation: { isRequired: true } }),
        shortDescription: fields.text({
          label: 'Short description',
          multiline: true,
          validation: { length: { min: 1 } },
        }),
        cover: fields.image({ label: 'Cover image', validation: { isRequired: true } }),
        coverAlt: fields.text({ label: 'Cover alt text', validation: { length: { min: 1 } } }),
        gallery,
        relevantWorks,
        featured: fields.checkbox({ label: 'Featured on home page' }),
        order: fields.integer({ label: 'Featured order (optional)' }),
        draft: fields.checkbox({ label: 'Draft (hidden from production)' }),
        body: fields.markdoc({ label: 'Description' }),
      },
    }),
  },

  singletons: {
    settings: singleton({
      label: 'Site settings',
      path: 'src/content/settings/site',
      format: { data: 'yaml' },
      schema: {
        heroHeadline: fields.text({ label: 'Hero headline', validation: { length: { min: 1 } } }),
        heroTagline: fields.text({ label: 'Hero tagline', multiline: true }),
        heroPoster: fields.image({ label: 'Hero poster image', validation: { isRequired: true } }),
        heroPosterAlt: fields.text({ label: 'Hero poster alt text', validation: { length: { min: 1 } } }),
        heroVideoSrc: fields.text({
          label: 'Hero video (mp4) path',
          description: 'Optional. Path to a compressed loop placed in /public, e.g. /media/hero.mp4',
        }),
        heroVideoWebm: fields.text({ label: 'Hero video (webm) path', description: 'Optional.' }),
        contactEmail: fields.text({ label: 'Contact email' }),
        contactText: fields.text({ label: 'Contact intro text', multiline: true }),
        socials: fields.array(
          fields.object({
            label: fields.text({ label: 'Label' }),
            url: fields.url({ label: 'URL' }),
          }),
          { label: 'Social links', itemLabel: (p) => p.fields.label.value }
        ),
      },
    }),

    about: singleton({
      label: 'About page',
      path: 'src/content/about/index',
      format: { contentField: 'body' },
      entryLayout: 'content',
      schema: {
        title: fields.text({ label: 'Page title', defaultValue: 'About' }),
        intro: fields.text({ label: 'Intro (optional)', multiline: true }),
        body: fields.markdoc({ label: 'Body' }),
      },
    }),
  },
});
