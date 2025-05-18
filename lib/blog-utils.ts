import fs from 'fs';
import path from 'path';
import matter from 'gray-matter'; // For parsing frontmatter
import { remark } from 'remark';
import html from 'remark-html';
// import slugPlugin from 'remark-slug'; // Removed
import type { BlogPost, BlogFrontmatter } from '@/types/blog';
import type { Author } from '@/types/author';

const postsDirectory = path.join(process.cwd(), 'content/blog');
const authorsFilePath = path.join(process.cwd(), 'config/authors.json');

let authors: Author[] = [];

// Load authors data once
function loadAuthors(): Author[] {
  if (authors.length > 0) return authors;
  try {
    const jsonData = fs.readFileSync(authorsFilePath, 'utf-8');
    authors = JSON.parse(jsonData).authors || [];
    return authors;
  } catch (error) {
    console.error("Failed to load or parse authors.json:", error);
    return []; // Return empty array on error
  }
}

function getAuthorById(id: string): Author | undefined {
  loadAuthors();
  return authors.find(author => author.id === id);
}

/**
 * Gets all post data, parses frontmatter, but does not filter by publish date yet.
 * @returns Array of all blog posts with frontmatter and raw content.
 */
export function getAllPostData(): BlogPost[] {
  loadAuthors(); // Ensure authors are loaded
  
  // Check if the posts directory exists
  if (!fs.existsSync(postsDirectory)) {
    console.warn(`Blog posts directory not found: ${postsDirectory}. Returning empty array.`);
    return [];
  }
  
  const fileNames = fs.readdirSync(postsDirectory);
  
  if (fileNames.length === 0) {
    // console.log(`No blog posts found in: ${postsDirectory}. Returning empty array.`);
    return [];
  }

  const allPostsData = fileNames.map((fileName) => {
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data: rawFrontmatter, content: rawMarkdownBody } = matter(fileContents); // content is raw markdown body

    let processedTags: string[] = [];
    if (typeof rawFrontmatter.tags === 'string') {
      processedTags = rawFrontmatter.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    } else if (Array.isArray(rawFrontmatter.tags)) {
      processedTags = rawFrontmatter.tags.map(tag => String(tag).trim()).filter(tag => tag.length > 0);
    }

    const frontmatter: BlogFrontmatter = {
      title: rawFrontmatter.title || 'Untitled Blog Post',
      slug: rawFrontmatter.slug || fileName.replace(/\.md$/, ''),
      publishDate: rawFrontmatter.publishDate || new Date(0).toISOString(), // Default to a very old date
      excerpt: rawFrontmatter.excerpt || '',
      authorId: rawFrontmatter.authorId || 'redazione', // Default to redazione
      tags: processedTags,
      featuredImage: rawFrontmatter.featuredImage,
   
      accordionData: parseAccordionData(rawFrontmatter.accordionData),
    };

    // Separate main content from SEO elements if present
    let mainContentMarkdown = rawMarkdownBody;
    const seoElementsRegex = new RegExp("\\n(?:---\\n\\n)?\\*\\*SEO Elements:\\*\\*", "i");
    const seoElementsMatch = rawMarkdownBody.match(seoElementsRegex);

    if (seoElementsMatch && seoElementsMatch.index !== undefined) {
      mainContentMarkdown = rawMarkdownBody.substring(0, seoElementsMatch.index);
    }

    return {
      ...frontmatter,
      slug: frontmatter.slug,
      rawMarkdownContent: mainContentMarkdown.trim(), // Store raw markdown
      author: getAuthorById(frontmatter.authorId), // Embed author object
    };
  });

  return allPostsData.sort((a, b) => {
    if (new Date(a.publishDate) < new Date(b.publishDate)) {
      return 1;
    } else {
      return -1;
    }
  });
}

/**
 * Gets posts that are currently published (publishDate <= today).
 * @returns Array of published BlogPost objects, sorted by date (newest first).
 */
export function getPublishedPosts(): Omit<BlogPost, 'rawMarkdownContent'>[] { // Returns without HTML content for listings
  const allPosts = getAllPostData();
  const today = new Date();

  const publishedPosts = allPosts.filter(post => {
    const postDate = new Date(post.publishDate);
    return postDate <= today;
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return publishedPosts.map(({ rawMarkdownContent, ...post }) => post); // Exclude rawMarkdownContent for listing
}

/**
 * Gets a specific post by slug, including its HTML content.
 * @param slug The slug of the post to retrieve.
 * @returns The BlogPost object with HTML content, or null if not found.
 */
export function getPostBySlug(slug: string): BlogPost | undefined {
  loadAuthors(); // Ensure authors are loaded
  try {
    const filePath = path.join(postsDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(filePath, "utf8");
    const { data: rawFrontmatter, content: rawMarkdownBody } = matter(fileContents);

    let processedTags: string[] = [];
    if (typeof rawFrontmatter.tags === 'string') {
      processedTags = rawFrontmatter.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    } else if (Array.isArray(rawFrontmatter.tags)) {
      processedTags = rawFrontmatter.tags.map(tag => String(tag).trim()).filter(tag => tag.length > 0);
    }

    const frontmatter: BlogFrontmatter = {
      title: rawFrontmatter.title || 'Untitled Blog Post',
      slug: rawFrontmatter.slug || slug, // Use function param slug as fallback
      publishDate: rawFrontmatter.publishDate || new Date(0).toISOString(), // Default to a very old date
      excerpt: rawFrontmatter.excerpt || '',
      authorId: rawFrontmatter.authorId || 'redazione', // Default to redazione
      tags: processedTags,
      featuredImage: rawFrontmatter.featuredImage,
  
      accordionData: parseAccordionData(rawFrontmatter.accordionData),
    };

    let mainContentMarkdown = rawMarkdownBody;
    const seoElementsRegex = new RegExp("\\n(?:---\\n\\n)?\\*\\*SEO Elements:\\*\\*", "i");
    const seoElementsMatch = rawMarkdownBody.match(seoElementsRegex);

    if (seoElementsMatch && seoElementsMatch.index !== undefined) {
      mainContentMarkdown = rawMarkdownBody.substring(0, seoElementsMatch.index);
    }

    return {
      ...frontmatter,
      slug: frontmatter.slug,
      rawMarkdownContent: mainContentMarkdown.trim(), // Store raw markdown
      author: getAuthorById(frontmatter.authorId), // Embed author object
    };
  } catch (error) {
    console.error(`Error reading post with slug ${slug}:`, error);
    return undefined;
  }
}

/**
 * Gets all slugs for published posts, for generateStaticParams.
 */
export function getPublishedPostSlugs() {
  const publishedPosts = getPublishedPosts();
  return publishedPosts.map(post => ({
    slug: post.slug,
  }));
}

// Helper function to safely parse accordionData
function parseAccordionData(data: unknown): Array<{ trigger: string; content: string; contentHtml?: string }> | undefined {
  if (!data) return undefined;
  let parsedData: Array<{ trigger: string; content: string }> | undefined;

  if (typeof data === 'string') {
    try {
      if (data.trim() === "" || data.trim().toLowerCase() === "empty" || data.trim().toLowerCase() === "null" || data.trim() === "[]") {
        return undefined;
      }
      parsedData = JSON.parse(data);
    } catch (error) {
      console.error("Error parsing accordionData from string:", error, "Raw data:", data);
      return undefined;
    }
  } else if (Array.isArray(data)) {
    parsedData = data;
  } else {
    console.warn("AccordionData is not a string or array:", data);
    return undefined;
  }

  if (Array.isArray(parsedData) && parsedData.every(item => typeof item.trigger === 'string' && typeof item.content === 'string')) {
    // Process content to HTML
    return parsedData.map(item => {
      const processedAccordionContent = remark()
        // .use(slugPlugin) // Removed
        .use(html)
        .processSync(item.content);
      return {
        ...item,
        contentHtml: processedAccordionContent.toString(),
      };
    });
  }
  console.warn("AccordionData, after potential parse, does not match expected structure:", parsedData);
  return undefined;
}

/**
 * Gets related posts based on shared tags.
 * @param currentSlug The slug of the current post, to exclude it from results.
 * @param currentTags An array of tags for the current post.
 * @param maxRelatedPosts The maximum number of related posts to return.
 * @returns An array of related BlogPost objects (summary version, without rawMarkdownContent).
 */
export function getRelatedPosts(
  currentSlug: string,
  currentTags: string[],
  maxRelatedPosts: number = 3
): Omit<BlogPost, 'rawMarkdownContent'>[] {
  if (!currentTags || currentTags.length === 0) {
    return [];
  }

  const publishedPosts = getPublishedPosts(); // This already returns Omit<BlogPost, 'rawMarkdownContent'>[]

  const related = publishedPosts
    .filter(post => {
      if (post.slug === currentSlug) {
        return false; // Exclude the current post
      }
      // Check if there's at least one common tag
      return post.tags && post.tags.some(tag => currentTags.includes(tag));
    })
    .sort((a, b) => { // Optional: sort by relevance (e.g., number of shared tags)
      const aSharedTags = a.tags?.filter(tag => currentTags.includes(tag)).length || 0;
      const bSharedTags = b.tags?.filter(tag => currentTags.includes(tag)).length || 0;
      return bSharedTags - aSharedTags; // Higher shared tags first
    })
    .slice(0, maxRelatedPosts);

  return related;
} 