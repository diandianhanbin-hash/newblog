import { visit } from 'unist-util-visit';

export default function rehypeArticleLinks({ site }) {
  const base = new URL(site);
  const siteHosts = new Set([base.hostname, base.hostname.replace(/^www\./, '')]);

  return (tree) => {
    visit(tree, 'element', (node) => {
      const { href, rel } = node.properties;
      if (node.tagName !== 'a' || typeof href !== 'string' || !URL.canParse(href, base)) return;

      const url = new URL(href, base);
      if (!['https:', 'http:'].includes(url.protocol) || siteHosts.has(url.hostname)) return;

      const existingRel = Array.isArray(rel) ? rel : String(rel ?? '').split(/\s+/).filter(Boolean);
      node.properties.target = '_blank';
      node.properties.rel = [...new Set([...existingRel, 'noopener', 'noreferrer'])];
    });
  };
}
