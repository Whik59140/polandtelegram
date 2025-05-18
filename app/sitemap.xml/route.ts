import { siteStrings, subcategoryList, getSubcategorySlug } from "@/lib/translations";
import type { SubcategoryKey } from "@/lib/slug-definitions";
import { getPublishedPosts } from "@/lib/blog-utils";

// Read from environment variable. This is critical for sitemap generation.
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

interface SitemapEntry {
  url: string;
  lastModified?: string | Date;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export async function GET() {
  if (!BASE_URL) {
    console.error("Error: NEXT_PUBLIC_BASE_URL is not set. Sitemap cannot be generated.");
    // Return a 500 error or an empty sitemap to indicate a server-side configuration issue.
    return new Response("Internal Server Error: Sitemap configuration is missing.", { status: 500 });
  }

  const today = new Date().toISOString().split('T')[0];

  const entries: SitemapEntry[] = [];

  // 1. Homepage
  entries.push({
    url: BASE_URL,
    lastModified: today,
    changeFrequency: 'daily',
    priority: 1.0,
  });

 
  (Object.values(siteStrings.slugs.parentCategories) as string[]).forEach(parentSlug => {
    // const parentSlug = germanCategorySlugs[categoryKey]; // Old logic
    if (parentSlug) {
      entries.push({
        url: `${BASE_URL}/${parentSlug}`,
        lastModified: today,
        changeFrequency: 'daily',
        priority: 0.8,
      });

      // 3. Subcategory Pages for each Parent Category
      (subcategoryList as SubcategoryKey[]).forEach(subcatKey => {
        const subSlug = getSubcategorySlug(subcatKey); // This now uses Spanish translations via siteStrings
        if (subSlug) {
          entries.push({
            url: `${BASE_URL}/${parentSlug}/${subSlug}`,
            lastModified: today,
            changeFrequency: 'weekly',
            priority: 0.6,
          });
        }
      });
    }
  });

  // 4. Blog Pages
  entries.push({
    url: `${BASE_URL}/blog`,
    lastModified: today,
    changeFrequency: 'daily',
    priority: 0.7,
  });

  const publishedBlogPosts = getPublishedPosts();
  publishedBlogPosts.forEach(post => {
    entries.push({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.publishDate).toISOString().split('T')[0],
      changeFrequency: 'yearly',
      priority: 0.6,
    });
  });

  // Static pages from siteStrings.navigation
  // This assumes your navigation items with direct paths (not category keys) are static pages
  // And that their paths are absolute (e.g., "/about-us") or relative to BASE_URL
  // Example: If siteStrings.navigation.about has path '/ueber-uns'
  // Object.values(siteStrings.navigation).forEach(navItem => {
  //   if (typeof navItem === 'object' && navItem.path && !Object.values(siteStrings.slugs.parentCategories).includes(navItem.path.replace('/',''))) {
  //     entries.push({
  //       url: `${BASE_URL}${navItem.path.startsWith('/') ? '' : '/'}${navItem.path}`,
  //       lastModified: today,
  //       changeFrequency: 'monthly',
  //       priority: 0.5,
  //     });
  //   }
  // });

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${entries
    .map(
      (entry) => `
  <url>
    <loc>${entry.url}</loc>
    ${entry.lastModified ? `<lastmod>${new Date(entry.lastModified).toISOString().split('T')[0]}</lastmod>` : ''}
    ${entry.changeFrequency ? `<changefreq>${entry.changeFrequency}</changefreq>` : ''}
    ${entry.priority ? `<priority>${entry.priority.toFixed(1)}</priority>` : ''}
  </url>`
    )
    .join('')}
</urlset>`;

  return new Response(sitemapXml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
} 