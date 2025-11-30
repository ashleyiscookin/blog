
A simple markdown-powered blog deployed on Cloudflare Workers with automatic CI/CD.

## Quick Start

### 1. Configure Secrets (Required for Deployment)

Go to your GitHub repository Settings → Secrets and variables → Actions, then add:

- `CLOUDFLARE_API_TOKEN` - Create at https://dash.cloudflare.com/profile/api-tokens
	- Permissions needed: Workers & Zones (Write)
- `CLOUDFLARE_ACCOUNT_ID` - Found in your Cloudflare dashboard

### 2. Add Blog Posts

Create markdown files in the `posts/` directory:

```markdown
# My First Post

2024-11-30

This is the content of my blog post.
It supports **markdown** formatting.
```

**Rules:**
- First `# Heading` = post title
- First date in `YYYY-MM-DD` format = publication date
- Filename becomes the URL slug: `posts/my-first-post.md` → `/my-first-post`

### 3. Deploy

Just push to `main` branch - GitHub Actions will automatically:
1. Build posts from markdown
2. Deploy to Cloudflare Workers
3. Go live at `https://blog.lovemaggi.de/`

## Local Development

```bash
npm install              # Install dependencies
npm run build           # Generate posts.json from markdown
npm run dev             # Preview locally (requires wrangler login)
npm run deploy          # Deploy manually (requires secrets configured)
```

## Project Structure

```
blog/
├── src/                 # Worker code
│   ├── index.js        # Request routing & rendering
│   └── posts.js        # Post management
├── posts/              # Markdown blog posts
├── scripts/build.js    # Build posts.json
├── .github/
│   └── workflows/      # GitHub Actions automation
└── wrangler.toml       # Cloudflare Workers config
```

## Architecture

- **Markdown → JSON**: `scripts/build.js` extracts metadata (title, date) and generates `posts.json`
- **Worker Rendering**: `src/index.js` serves HTML-rendered posts
- **No Database**: All posts bundled into the Worker at build time
- **Auto-Deploy**: GitHub Actions runs on every `main` push

See [.github/copilot-instructions.md](.github/copilot-instructions.md) for detailed AI agent guidance.
# blog