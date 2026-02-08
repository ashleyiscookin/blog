import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const postsDir = path.join(__dirname, '../posts');
const outputFile = path.join(__dirname, '../posts.json');

function slugify(text) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

function getLastCommitDate(filePath) {
    try {
        const repoRoot = path.join(__dirname, '..');
        // Use relative path from repo root for git command
        const relativeFilePath = path.relative(repoRoot, filePath);
        
        const date = execSync(`git log -1 --format=%ci -- "${relativeFilePath}"`, {
            encoding: 'utf-8',
            cwd: repoRoot,
            stdio: ['pipe', 'pipe', 'pipe']
        }).trim();
        
        if (date) {
            // Extract YYYY-MM-DD from git date format (YYYY-MM-DD HH:MM:SS +TIMEZONE)
            return date.split(' ')[0];
        }
    } catch (error) {
        // File not in git or git error - silently fail and return null
    }
    return null;
}

function extractMetadata(content, filename = '', commitDate = null) {
    const lines = content.split('\n');
    // Use filename as default title (without .md extension)
    let title = filename.replace(/\.md$/, '').trim();
    let date = null;

    // Look for H1 as title (overrides filename)
    const titleMatch = lines.find(line => line.startsWith('# '));
    if (titleMatch) {
        title = titleMatch.replace('# ', '').trim();
    }

    // Look for date in format: YYYY-MM-DD in content
    const dateMatch = content.match(/(\d{4}-\d{2}-\d{2})/);
    if (dateMatch) {
        date = dateMatch[1];
    }

    // If no date found in content, try to extract from filename
    if (!date) {
        // Try YYYY-MM-DD format in filename
        const filenameDateMatch = filename.match(/(\d{4}-\d{2}-\d{2})/);
        if (filenameDateMatch) {
            date = filenameDateMatch[1];
        } else {
            // Try DD.MM.YY format (e.g., 01.01.25 -> 2025-01-01)
            const dotDateMatch = filename.match(/(\d{2})\.(\d{2})\.(\d{2})/);
            if (dotDateMatch) {
                const [, day, month, year] = dotDateMatch;
                // Assume 20xx if year is 00-99
                const fullYear = parseInt(year) > 30 ? `19${year}` : `20${year}`;
                date = `${fullYear}-${month}-${day}`;
            }
        }
    }

    // Fallback to git commit date if available
    if (!date && commitDate) {
        date = commitDate;
    }

    // Fallback to today's date if still not found
    if (!date) {
        date = new Date().toISOString().split('T')[0];
    }

    return { title, date };
}

function buildPostsJson() {
    if (!fs.existsSync(postsDir)) {
        console.log('No posts directory found. Creating empty posts.json');
        fs.writeFileSync(outputFile, JSON.stringify([], null, 2));
        return;
    }

    const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));

    const posts = files.map(file => {
        const filePath = path.join(postsDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const commitDate = getLastCommitDate(filePath);
        const { title, date } = extractMetadata(content, file, commitDate);
        const slug = slugify(file.replace('.md', ''));

        // Generate excerpt: exclude H1 headings and dates, keep only actual content
        const lines = content.split('\n');
        const contentLines = lines.filter(line => {
            const trimmed = line.trim();
            // Exclude empty lines, H1 headings, and date lines (YYYY-MM-DD)
            return trimmed && !trimmed.startsWith('# ') && !/^\d{4}-\d{2}-\d{2}$/.test(trimmed);
        });
        
        // Take first 3 lines of actual content, sanitize markdown syntax
        let excerpt = contentLines.slice(0, 3).join('\n');
        
        // Replace markdown syntax with generic words or remove it
        excerpt = excerpt
            .replace(/!\[([^\]]*)\]\([^)]*\)/g, 'image') // ![alt](url) -> image
            .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // [text](url) -> text
            .replace(/\*\*([^*]+)\*\*/g, '$1') // **bold** -> bold
            .replace(/\*([^*]+)\*/g, '$1') // *italic* -> italic
            .replace(/__([^_]+)__/g, '$1') // __bold__ -> bold
            .replace(/_([^_]+)_/g, '$1') // _italic_ -> italic
            .replace(/`([^`]+)`/g, '$1'); // `code` -> code

        return {
            title,
            slug,
            date,
            content,
            excerpt,
        };
    });

    fs.writeFileSync(outputFile, JSON.stringify(posts, null, 2));
    console.log(`Built posts.json with ${posts.length} posts`);
}

buildPostsJson();
