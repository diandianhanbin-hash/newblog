import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypeArticleLinks from './src/lib/rehype-article-links.mjs';

const site = 'https://www.wengyb.com';

export default defineConfig({
  site,
  output: 'static',
  build: { format: 'preserve' },
  devToolbar: { enabled: false },
  markdown: {
    shikiConfig: { theme: 'github-dark-dimmed', wrap: false },
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex, rehypeRaw, [rehypeArticleLinks, { site }]],
    }),
  },
});
