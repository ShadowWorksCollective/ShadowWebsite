# ShadowWorks website — project guide

Audiovisual artist collective site + self-archiving content store. **Astro 6** (static) +
**Keystatic** (local mode) CMS, deployed on **Cloudflare Pages**. Minimal, dark, image-forward.

## Run it

```bash
npm install
npm run dev      # site at http://localhost:4321 , CMS admin at http://localhost:4321/keystatic
npm run build    # static output to ./dist
npm run preview  # serve the built ./dist
npm run check    # astro check (type + content validation)
```

Requires **Node ≥ 22.12**. (Note: at build time no Node was installed system-wide on this
machine — Zed's bundled Node was used. Install Node via Homebrew/nvm for normal dev, and
`.claude/launch.json` assumes `npm` is on your PATH.)

## How content works

Three collections + two singletons, all under `src/content/`, **folder-per-entry**
(`<kind>/<slug>/index.mdoc` + co-located images). The folder name is the URL slug, and
the folder structure doubles as the archive.

- `works/`, `events/`, `commissions/` — Markdoc body + frontmatter.
- `settings/site.yaml` — global site settings (hero, contact, socials). No body.
- `about/index.mdoc` — the About page.

### ⚠️ The two-schema contract (read before editing schemas)
`src/content.config.ts` (Zod, what Astro reads/validates) and `keystatic.config.ts`
(what the CMS writes) describe the **same files**. Change one → change the other in the
same commit, or the build fails with `InvalidContentEntryFrontmatter`.

### Authoring rules (Keystatic-first)
- **Edit content in the Keystatic admin** (`/keystatic`) — forms + a Markdoc rich-text body.
- **Do NOT hand-edit a body in Obsidian/another editor and then re-save that entry in
  Keystatic.** Keystatic re-serializes bodies on save and will mangle anything outside its
  schema. There are **no `[[wikilinks]]`** — cross-link with the **Relevant works** picker
  (typed relationship) and standard `[label](/works/slug)` Markdown links in bodies.
- **Don't rename a work's title/slug after events link to it.** Relationship fields store
  the slug as plain text and won't auto-update; renaming silently breaks the link.

### Relationships (single source of truth)
The works↔events link lives **only on the event** (`relevantWorks`). A work's "Where it's
been shown" list is **derived at build time** by reverse-filtering events
(`getEventsForWork` in `src/lib/queries.ts`) — never stored on the work.

## Architecture

- `src/lib/queries.ts` — the data layer. ALL filtering/sorting lives here
  (`getFeaturedWorks`, `getUpcomingEvents`, `getPastEvents`, `getEventsForWork`, …).
  Components never call `getCollection`.
- `src/lib/images.ts` — resolves co-located image filenames to optimized `astro:assets`
  metadata via `import.meta.glob`.
- `src/components/` — dumb, typed presentation. `EventList` is the single reusable events
  module (home / events page ×2 / each work page).
- `src/pages/` — routes; `[slug].astro` pages use `getStaticPaths` + `render()`.
- `markdoc.config.mjs` — custom body tags: `{% video %}` and `{% callout %}`.

## Media
- **Images:** co-located in each entry folder, optimized to AVIF/WebP automatically. Keep
  them in `src/content/` (NOT `public/`, which is served unoptimized).
- **Video:** embed YouTube/Vimeo via gallery "Video" items or the `{% video %}` body tag.
  Self-hosted hero loop: put a compressed mp4/webm in `public/` and set the paths in Site
  settings (the hero is reduced-motion-gated with a pause control, poster is the LCP).
- `scripts/gen-placeholders.mjs` generated the current placeholder images — replace them
  with real artwork (same filenames, or re-point frontmatter).

## Deploy (Cloudflare Pages)
- Build command `npm run build`, output dir `dist`, set `NODE_VERSION`/`.nvmrc` (Node 22+).
- The site is **fully static** — the `/keystatic` admin is dev-only (gated to `astro dev`
  in `astro.config.mjs`), so no SSR adapter is needed.
- Workflow: pull → edit locally (Keystatic) → commit → push → Cloudflare auto-builds.
- **Scheduled rebuild:** upcoming/past event split is computed at build time and goes stale
  between deploys. `.github/workflows/scheduled-rebuild.yml` pings a Cloudflare deploy hook
  daily — set the `CLOUDFLARE_DEPLOY_HOOK_URL` repo secret to enable it.

## TODO before launch
- Set the real domain in `astro.config.mjs` (`site:`) for correct canonical/OG URLs.
- Replace placeholder images with real artwork; add a real hero video if wanted.
- Wire the contact form (Cloudflare Worker / Formspree) — currently mailto + socials.
