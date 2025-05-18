export interface BlogFrontmatter {
  title: string;
  slug: string;
  publishDate: string; // ISO date string (e.g., "2024-07-01")
  excerpt: string;
  authorId: string; // Changed from author to authorId
  tags: string[];
  featuredImage?: string; // Optional
  accordionData?: Array<{ trigger: string; content: string; contentHtml?: string }>; // Optional for FAQ/collapsible sections
  // Add any other frontmatter fields you might need
}

export interface BlogPost extends BlogFrontmatter {
  rawMarkdownContent: string; // Changed from contentHtml
  author?: import('./author').Author; // Embed full author details
} 