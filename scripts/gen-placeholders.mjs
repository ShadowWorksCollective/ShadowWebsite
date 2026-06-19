// Dev helper: generates dark, on-brand placeholder images so the site builds
// before real artwork exists. Safe to delete once real images are added.
// Run: node scripts/gen-placeholders.mjs
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');

/** @type {{file: string, w: number, h: number, hue: number}[]} */
const specs = [
  { file: 'src/content/works/iris/cover.jpg', w: 1600, h: 1000, hue: 280 },
  { file: 'src/content/works/iris/gallery-1.jpg', w: 1600, h: 1000, hue: 300 },
  { file: 'src/content/works/iris/gallery-2.jpg', w: 1600, h: 1000, hue: 265 },
  { file: 'src/content/works/helical/cover.jpg', w: 1600, h: 1000, hue: 190 },
  { file: 'src/content/works/moment-of-reflection/cover.jpg', w: 1600, h: 1000, hue: 160 },
  { file: 'src/content/events/spectra-festival-2026/poster.jpg', w: 1200, h: 1500, hue: 320 },
  { file: 'src/content/events/resonance-2026/poster.jpg', w: 1200, h: 1500, hue: 220 },
  { file: 'src/content/events/lumen-exhibition-2025/poster.jpg', w: 1200, h: 1500, hue: 40 },
  { file: 'src/content/commissions/aurora/cover.jpg', w: 1600, h: 1000, hue: 140 },
  { file: 'src/content/commissions/aurora/gallery-1.jpg', w: 1600, h: 1000, hue: 120 },
  { file: 'src/content/commissions/pulse/cover.jpg', w: 1600, h: 1000, hue: 0 },
  { file: 'src/content/settings/hero-poster.jpg', w: 2400, h: 1200, hue: 255 },
];

function svg(w, h, hue) {
  const h2 = (hue + 45) % 360;
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="hsl(${hue} 55% 16%)"/>
      <stop offset="55%" stop-color="hsl(${h2} 45% 9%)"/>
      <stop offset="100%" stop-color="hsl(${hue} 40% 5%)"/>
    </linearGradient>
    <radialGradient id="glow" cx="32%" cy="30%" r="70%">
      <stop offset="0%" stop-color="hsl(${hue} 80% 60% / 0.35)"/>
      <stop offset="60%" stop-color="hsl(${hue} 80% 50% / 0.06)"/>
      <stop offset="100%" stop-color="hsl(${hue} 80% 50% / 0)"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <rect width="${w}" height="${h}" fill="url(#glow)"/>
  <circle cx="${w * 0.78}" cy="${h * 0.8}" r="${Math.min(w, h) * 0.28}" fill="hsl(${h2} 70% 55% / 0.10)"/>
</svg>`;
}

for (const { file, w, h, hue } of specs) {
  const out = path.join(root, file);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  await sharp(Buffer.from(svg(w, h, hue))).jpeg({ quality: 82, mozjpeg: true }).toFile(out);
  console.log('wrote', file);
}
console.log('done:', specs.length, 'images');
