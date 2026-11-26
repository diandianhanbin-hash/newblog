import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default defineConfig({
  site: 'https://www.wengyb.com',
  output: 'static',
  build: { format: 'preserve' },
  devToolbar: { enabled: false },
  markdown: {
    shikiConfig: { theme: 'github-dark-dimmed', wrap: false },
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
    }),
  },
});
