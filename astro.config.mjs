import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';

// Keystatic's admin (/keystatic) needs on-demand routes. We run it ONLY on the
// local dev server (`astro dev`) so the production build stays fully static and
// needs no SSR adapter on Cloudflare Pages. Editing is local: pull -> edit -> push.
const enableKeystatic = process.argv.includes('dev');

// https://astro.build/config
export default defineConfig({
  // TODO: set this to the real production domain before launch (used for canonical/OG URLs).
  site: 'https://shadowworks.studio',
  output: 'static',
  image: {
    // Per-image control: components pass explicit `widths`/`sizes` (+ CSS object-fit
    // for cover thumbnails). No global `layout` so it never fights object-fit cover.
    responsiveStyles: true,
  },
  integrations: [react(), markdoc(), ...(enableKeystatic ? [keystatic()] : [])],
});
