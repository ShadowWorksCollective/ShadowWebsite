import { defineMarkdocConfig, component } from '@astrojs/markdoc/config';

// Custom Markdoc tags editors can insert into bodies via the Keystatic editor.
export default defineMarkdocConfig({
  tags: {
    video: {
      render: component('./src/components/VideoEmbed.astro'),
      attributes: {
        provider: { type: String, required: true, matches: ['youtube', 'vimeo'] },
        videoId: { type: String, required: true },
        title: { type: String },
        caption: { type: String },
      },
    },
    callout: {
      render: component('./src/components/Callout.astro'),
      attributes: {
        kind: { type: String, default: 'note', matches: ['note', 'info', 'warning'] },
        title: { type: String },
      },
    },
  },
});
