// Helper functions to manage blog posts
// Posts are stored as markdown files in the posts/ directory
// During deployment, they are bundled into the Worker

import posts from '../posts.json' assert { type: 'json' };

export async function getPost(env, slug) {
    const post = posts.find(p => p.slug === slug);
    if (!post) return null;

    return {
        title: post.title,
        slug: post.slug,
        date: post.date,
        content: post.content,
    };
}

export async function listPosts(env) {
    return posts
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(post => ({
            title: post.title,
            slug: post.slug,
            date: new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            excerpt: post.excerpt || post.content.substring(0, 150) + '...',
        }));
}
