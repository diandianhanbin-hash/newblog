import { render } from 'astro:content';
import type { APIRoute } from 'astro';
import { getPosts, postUrl } from '../lib/posts';
import type { SearchEntry } from '../lib/search';

export const GET: APIRoute = async () => {
  const posts = await getPosts();
  const entries: SearchEntry[] = await Promise.all(posts.map(async (post) => {
    const { headings } = await render(post);
    return {
      title: post.data.title,
      url: postUrl(post),
      sections: headings.filter((heading) => heading.depth === 2)
        .map(({ text, slug }) => ({ title: text, id: slug })),
    };
  }));
  return Response.json(entries);
};
