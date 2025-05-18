import Link from 'next/link';
import Image from 'next/image'; // Re-add Image import
import { getPublishedPosts } from '@/lib/blog-utils';
import type { BlogFrontmatter } from '@/types/blog'; // Only need frontmatter for listing
import { siteStrings } from '@/lib/translations'; // Import siteStrings
import type { Metadata } from 'next'; // Import Metadata type
import { JoinTelegramSection } from '@/components/common/join-telegram-section'; // Added import
import { ArrowRightCircle } from 'lucide-react'; // Added for button icon
import affiliateLinksData from '@/config/affiliate-links.json'; // Import affiliate links data

// Define AffiliateLink interface (if not already defined globally and imported)
interface AffiliateLink {
  id: string;
  name: string;
  url: string;
  description: string;
  tags: string[];
  imageUrl?: string;
  category?: string;
  isBestOffer?: boolean;
}

// Helper function to get a deterministic random image index
function getDeterministicRandomImageIndex(identifier: string, imageCount: number): number {
  let hash = 0;
  if (identifier.length === 0) {
    return 0;
  }
  for (let i = 0; i < identifier.length; i++) {
    hash = (hash << 5) - hash + identifier.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash) % imageCount;
}

// Metadata for the blog listing page
export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) {
    console.error("FATAL ERROR: NEXT_PUBLIC_BASE_URL environment variable is not set. This is required for metadata generation in blog/page.tsx.");
    throw new Error("FATAL ERROR: NEXT_PUBLIC_BASE_URL environment variable is not set.");
  }

  const title = `${siteStrings.blog.pageTitle} | ${siteStrings.siteName}`;
  const description = siteStrings.blog.metaDescription;

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      url: `${baseUrl}/blog`,
      siteName: siteStrings.siteName,
      type: 'website',
      locale: process.env.NEXT_PUBLIC_OG_LOCALE || 'en_US',
    },
    alternates: {
      canonical: `${baseUrl}/blog`,
    },
  };
}

export default function BlogIndexPage() {
  if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_OG_LOCALE) {
    console.warn("WARN: NEXT_PUBLIC_OG_LOCALE is not set. OpenGraph locale in blog/page.tsx will default to 'en_US'. Consider setting this in your .env file (e.g., NEXT_PUBLIC_OG_LOCALE=es_ES).");
  }

  const posts = getPublishedPosts() as Omit<BlogFrontmatter, 'contentHtml'>[];
  const allAffiliateLinks: AffiliateLink[] = affiliateLinksData.affiliateLinks; // Load all affiliate links

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Centered JoinTelegramSection at the top */}
      <div className="mb-10 flex justify-center">
        <JoinTelegramSection category={siteStrings.navigation.blog} />
      </div>

      {/* REMOVE Static Blog Banner Image from here */}
      {/* 
      <div className="mb-10 text-center">
        <Image 
          src="/blog/blog.webp" 
          alt="Blog Telegram Italia - Notizie e Guide su Gruppi, Canali e Chat" 
          width={728} 
          height={150} 
          priority 
          className="rounded-lg shadow-md mx-auto"
        />
      </div> 
      */}

      <h1 className="text-4xl font-bold text-primary mb-10 text-center">
        {siteStrings.blog.pageTitle}
      </h1>

      {/* ===== THEMATIC BUTTONS SECTION (Adapted from Home Page) ===== */}
      {siteStrings.blog?.thematicButtons && (
        <section className="my-10 sm:my-12">
          <h2 className="text-2xl font-semibold text-center mb-6">
            {siteStrings.footer.exploreTopicsTitle}
          </h2>
          <div className="flex flex-wrap justify-center items-stretch gap-4 md:gap-5">
            {[
              // Use original descriptive keys from siteStrings.blog.thematicButtons to get labels
              // Map them to the correct targetId for affiliate-links.json
              { label: siteStrings.blog.thematicButtons.liveWebcams, targetId: "cam" },
              { label: siteStrings.blog.thematicButtons.sexMeetings, targetId: "to-fuck" },
              { label: siteStrings.blog.thematicButtons.gayMeetings, targetId: "gay" },
              { label: siteStrings.blog.thematicButtons.transMeetings, targetId: "trans" },
              { label: siteStrings.blog.thematicButtons.seriousDates, targetId: "-woman" },
            ].map(buttonConfig => {
              const affiliateLink = allAffiliateLinks.find(link => link.id === buttonConfig.targetId);
              const href = affiliateLink ? affiliateLink.url : "/#"; // Use affiliate URL, fallback to /#

              return (
                <Link key={buttonConfig.targetId} href={href} target="_blank" rel="noopener noreferrer" passHref className="flex" aria-label={siteStrings.ariaLabels.thematicButtonLink?.replace('{label}', buttonConfig.label) || buttonConfig.label}>
                  <button
                    className="w-full h-full px-4 py-3 sm:px-6 bg-gradient-to-r from-primary to-purple-600 hover:from-purple-600 hover:to-primary text-white font-semibold rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75 hover:scale-105 active:scale-95 text-sm sm:text-base flex items-center justify-center space-x-2"
                  >
                    <span>{buttonConfig.label}</span>
                    <ArrowRightCircle className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
                  </button>
                </Link>
              );
            })}
          </div>
        </section>
      )}
      {/* ===== END THEMATIC BUTTONS SECTION ===== */}
      
      {posts.length === 0 ? (
        <p className="text-center text-muted-foreground">
          {siteStrings.blog.noArticles}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => {
            const imageIndex = getDeterministicRandomImageIndex(post.slug, 20); // 20 images from 1.webp to 20.webp
            const randomImageUrl = `/blog/${imageIndex + 1}.webp`;
            // Determine locale for date formatting from siteStrings.htmlLang or fallback
            const dateLocale = siteStrings.htmlLang || 'en-US'; // Default to en-US if not specified
            const publishedDate = new Date(post.publishDate).toLocaleDateString(dateLocale, { year: 'numeric', month: 'long', day: 'numeric' });

            return (
              <article key={post.slug} className="bg-card text-card-foreground rounded-lg shadow-lg overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:scale-105">
                <Link href={`/blog/${post.slug}`} className="block group" aria-label={siteStrings.ariaLabels.blogPostLink?.replace('{title}', post.title) || post.title}>
                  <div className="aspect-w-16 aspect-h-9 mb-4 overflow-hidden rounded-lg group-hover:opacity-80 transition-opacity">
                    <Image
                      src={randomImageUrl}
                      alt={siteStrings.ariaLabels.blogPostImageAlt?.replace('{title}', post.title) || post.title}
                      width={400}
                      height={225}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <h2 className="text-xl lg:text-2xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                </Link>
                <p className="text-muted-foreground text-sm mb-3">
                  {siteStrings.blog.publishedOn} {publishedDate}
                </p>
                <p className="text-muted-foreground mb-4 flex-grow">{post.excerpt}</p>
                <Link href={`/blog/${post.slug}`} passHref className="mt-auto self-start">
                  <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-opacity-85 transition-colors">
                    {siteStrings.blog.readMore}
                  </button>
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
} 