import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

function extractMetadata(content) {
    const lines = content.split('\n');
    let title = 'Untitled';
    let date = new Date().toISOString().split('T')[0];

    // Look for H1 as title
    const titleMatch = lines.find(line => line.startsWith('# '));
    if (titleMatch) {
        title = titleMatch.replace('# ', '').trim();
    }

    // Look for date in format: YYYY-MM-DD
    const dateMatch = content.match(/(\d{4}-\d{2}-\d{2})/);
    if (dateMatch) {
        date = dateMatch[1];
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
        const { title, date } = extractMetadata(content);
        const slug = slugify(file.replace('.md', ''));

        return {
            title,
            slug,
            date,
            content,
            excerpt: content.split('\n').slice(0, 3).join('\n'),
        };
    });

    fs.writeFileSync(outputFile, JSON.stringify(posts, null, 2));
    console.log(`Built posts.json with ${posts.length} posts`);
}

buildPostsJson();
