# Welcome to Simple Blog

2024-11-30

This is your first blog post! It's stored as a simple markdown file in the `posts/` directory.

## How it works

- Each markdown file in the `posts/` directory becomes a blog post
- The filename (without `.md`) becomes the URL slug
- The first H1 heading is used as the post title
- The first date in YYYY-MM-DD format is used as the publication date

## Publishing

When you push changes to this repository:

1. GitHub Actions automatically runs `npm run build`
2. This converts all markdown posts to a `posts.json` file
3. The Worker bundle is deployed to Cloudflare
4. Your blog is live at `https://blog.lovemaggi.de/`

Try editing this file or adding a new markdown file to the `posts/` directory!
