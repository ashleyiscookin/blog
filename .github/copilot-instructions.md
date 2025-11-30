
## Required Setup for Deployment

Before the CI/CD pipeline can deploy:

1. **Configure GitHub Secrets** in repository settings:
  - Go to Settings → Secrets and variables → Actions
  - Add `CLOUDFLARE_API_TOKEN`: Generate at https://dash.cloudflare.com/profile/api-tokens (requires Workers & Zones write permission)
  - Add `CLOUDFLARE_ACCOUNT_ID`: Found in Cloudflare dashboard URL or account settings

2. **DNS Setup** (one-time):
  - Add DNS records to route `blog.lovemaggi.de` via Cloudflare (if not already configured)
  - Route must be under the `lovemaggi.de` zone in your Cloudflare account

3. **Local Testing** (optional):
  - Authenticate with Cloudflare: `npx wrangler login`
  - Run `npm run dev` for local preview
  - Run `npm run deploy` to test deployment locally (requires valid secrets)
# Simple Blog - Copilot Instructions

## Project Overview

Simple Blog is a markdown-powered blog platform deployed on Cloudflare Workers. Each markdown file in the `posts/` directory is automatically converted to a blog post accessible at `https://blog.lovemaggi.de/`.

## Architecture

- **Worker (`src/index.js`)**: Handles HTTP requests - serves index page or individual posts
- **Posts Manager (`src/posts.js`)**: Queries the posts.json manifest for retrieving/listing posts
- **Build Script (`scripts/build.js`)**: Scans `posts/` directory, extracts metadata (title, date), and generates `posts.json`
- **Markdown Posts (`posts/*.md`)**: Source files for blog content

**Key Flow**: Repository changes → GitHub Actions → Build posts → Deploy Worker to Cloudflare → Live

## Writing Blog Posts

Posts are markdown files stored in `posts/` directory. Post structure:

```markdown
# Post Title

2024-11-30

Your content here...
```

**Rules**:
- First H1 (`# Title`) becomes the post title
- First date in YYYY-MM-DD format is the publication date
- Filename (slugified) becomes the URL slug: `posts/my-first-post.md` → `https://blog.lovemaggi.de/my-first-post`

## Critical Configuration

- **Domain**: `blog.lovemaggi.de` (routed via Cloudflare)
- **wrangler.toml**: Routes defined with zone `lovemaggi.de`
- **GitHub Secrets** (required for deployment):
  - `CLOUDFLARE_API_TOKEN`: Personal API token
  - `CLOUDFLARE_ACCOUNT_ID`: Cloudflare account ID

## Development Workflow

```bash
npm install          # Install dependencies
npm run dev         # Local development (wrangler dev)
npm run build       # Build posts.json from markdown files
npm run deploy      # Deploy to Cloudflare (requires auth)
```

## Key Files & Patterns

- **posts.json**: Auto-generated manifest of all posts (commit to repo)
- **marked library**: Used for rendering markdown to HTML
- **HTML templates**: Defined inline in Worker for minimal bundle size
- **Styling**: Minimal CSS for blog aesthetics (responsive, dark-friendly)

## Deployment

Auto-deployment is triggered on:
- `main` branch pushes (full deployment)
- Pull requests (validation only, no deployment)

The GitHub Actions workflow (`.github/workflows/deploy.yml`) handles the complete deployment pipeline. No manual deployment steps required.

## Important Notes

- Posts are bundled into the Worker at build time (no database needed)
- Sorted by date descending on the index page
- Each post is a standalone HTML response (no API, fully rendered)
