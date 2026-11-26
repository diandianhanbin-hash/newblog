import { getCollection, type CollectionEntry } from 'astro:content';
import { site } from './site';

export type Post = CollectionEntry<'posts'>;

const byName = new Intl.Collator('zh-CN');
const dateFormatter = new Intl.DateTimeFormat('sv-SE', {
  year: 'numeric', month: '2-digit', day: '2-digit', timeZone: site.timeZone,
});

export const postsPerPage = 12;

export function publicationDate(post: Post) {
  return dateFormatter.format(new Date(post.data.publishedAt));
}

export function postUrl(post: Post) {
  return post.data.path.split('/').map(encodeURIComponent).join('/');
}

export function categoryUrl(category: string) {
  return '/categories/' + encodeURIComponent(category) + '/';
}

export function tagUrl(tag: string) {
  return '/tags/' + encodeURIComponent(tag) + '/';
}

export function homePageUrl(page: number) {
  return page === 1 ? '/' : '/page/' + page + '/';
}

export async function getPosts() {
  const posts = await getCollection('posts');
  const paths = new Set<string>();
  for (const post of posts) {
    for (const value of [post.data.path, ...post.data.aliases]) {
      const path = value.normalize('NFC');
      if (paths.has(path)) throw new Error('文章路径重复 ' + path);
      paths.add(path);
    }
  }
  return posts.sort((a, b) =>
    Date.parse(b.data.publishedAt) - Date.parse(a.data.publishedAt) ||
    byName.compare(a.data.path, b.data.path),
  );
}

export function groupPosts(posts: Post[], key: 'categories' | 'tags') {
  const groups = new Map<string, Post[]>();
  for (const post of posts) {
    for (const name of new Set(post.data[key])) {
      const group = groups.get(name) ?? [];
      group.push(post);
      groups.set(name, group);
    }
  }
  return [...groups].sort(([a, first], [b, second]) =>
    second.length - first.length || byName.compare(a, b),
  ).map(([name, entries]) => ({ name, entries }));
}

export function postExcerpt(post: Post) {
  if (post.data.description) return post.data.description;
  const paragraphs = post.body?.split(/\r?\n\s*\r?\n/) ?? [];
  const paragraph = paragraphs.map((part) => part.trim()).find((part) =>
    /^[\p{L}\p{N}“「《（]/u.test(part) && !/^(https?:\/\/|\S+:\s*$)/u.test(part),
  );
  if (!paragraph) return '';
  const plain = paragraph
    .replace(/!\[[^\]]*\]\([^\n]*?\)/g, '')
    .replace(/\[([^\]]+)\]\([^\n]*?\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/[`*_~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return plain.length > 105 ? plain.slice(0, 105) + '…' : plain;
}
