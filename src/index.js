<iframe data-testid="embed-iframe" style="border-radius:12px" src="https://open.spotify.com/embed/album/0XHtLe0HkWnnPdomKVoThv?utm_source=generator" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>


import { marked } from 'marked';
import { getPost, listPosts } from './posts.js';

const HTML_TEMPLATE = (content, title) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Simple Blog</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      line-height: 1.6;
      color: #333;
      background: #fafafa;
    }
    article {
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    h1 {
      margin-top: 0;
      border-bottom: 3px solid #0078d4;
      padding-bottom: 10px;
    }
    .meta {
      color: #666;
      font-size: 14px;
      margin-bottom: 20px;
    }
    code {
      background: #f4f4f4;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
    }
    pre {
      background: #f4f4f4;
      padding: 15px;
      border-radius: 5px;
      overflow-x: auto;
    }
    pre code {
      padding: 0;
    }
    a {
      color: #0078d4;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    .nav {
      margin: 20px 0;
      padding: 20px;
      background: white;
      border-radius: 8px;
    }
    .nav a {
      margin-right: 20px;
    }
  </style>
</head>
<body>
  <nav class="nav">
    <a href="/">← Back to Posts</a>
  </nav>
  <article>
    ${content}
  </article>
</body>
</html>
`;

const INDEX_TEMPLATE = (posts) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Simple Blog</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      line-height: 1.6;
      color: #333;
      background: #fafafa;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    .header h1 {
      margin: 0;
      color: #0078d4;
    }
    .posts {
      list-style: none;
      padding: 0;
    }
    .post-item {
      background: white;
      padding: 20px;
      margin-bottom: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: transform 0.2s;
    }
    .post-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .post-title {
      margin: 0 0 10px 0;
    }
    .post-title a {
      color: #0078d4;
      text-decoration: none;
      font-size: 20px;
      font-weight: 600;
    }
    .post-title a:hover {
      text-decoration: underline;
    }
    .post-date {
      color: #666;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📝 Simple Blog</h1>
    <p>Powered by Cloudflare Workers</p>
  </div>
  <ul class="posts">
    ${posts.map(post => `
      <li class="post-item">
        <h2 class="post-title">
          <a href="/${post.slug}">${post.title}</a>
        </h2>
        <div class="post-date">${post.date}</div>
        <p>${post.excerpt}</p>
      </li>
    `).join('')}
  </ul>
</body>
</html>
`;

export default {
    async fetch(request, env, ctx) {
        try {
            const url = new URL(request.url);
            const path = url.pathname;

            // Root path - list all posts
            if (path === '/' || path === '') {
                const posts = await listPosts(env);
                return new Response(INDEX_TEMPLATE(posts), {
                    headers: { 'Content-Type': 'text/html; charset=utf-8' },
                });
            }

            // Post path - get specific post
            const slug = path.slice(1); // Remove leading slash
            const post = await getPost(env, slug);

            if (!post) {
                return new Response('Post not found', { status: 404 });
            }

            const htmlContent = await marked(post.content);
            const title = post.title || slug;

            return new Response(HTML_TEMPLATE(htmlContent, title), {
                headers: { 'Content-Type': 'text/html; charset=utf-8' },
            });
        } catch (error) {
            console.error(error);
            return new Response('Error processing request', { status: 500 });
        }
    },
};
