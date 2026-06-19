import type { ImageMetadata } from 'astro';

/**
 * Resolves co-located content images (stored in frontmatter as bare filenames)
 * to optimizable astro:assets ImageMetadata. Eagerly globs every image under
 * src/content so lookups are synchronous in .astro components.
 */
const images = import.meta.glob<{ default: ImageMetadata }>(
  '/src/content/**/*.{jpg,jpeg,png,webp,avif,gif}',
  { eager: true },
);

/** Look up an image by its project-root path, e.g. "/src/content/works/iris/cover.jpg". */
export function resolveImage(path: string): ImageMetadata {
  const mod = images[path];
  if (!mod) {
    throw new Error(
      `[images] No image found at "${path}".\nKnown images:\n  ${Object.keys(images).join('\n  ')}`,
    );
  }
  return mod.default;
}

type AnyEntry = { filePath?: string };

/**
 * Resolve a file co-located in an entry's folder (the folder containing
 * index.mdoc / site.yaml) to its ImageMetadata.
 */
export function entryAsset(entry: AnyEntry, filename: string): ImageMetadata {
  if (!entry.filePath) {
    throw new Error('[images] entry has no filePath; cannot resolve co-located asset.');
  }
  const dir = entry.filePath.replace(/\/[^/]+$/, ''); // strip "/index.mdoc" or "/site.yaml"
  const rooted = dir.startsWith('/') ? dir : `/${dir}`;
  return resolveImage(`${rooted}/${filename}`);
}
