import { getPostBySlug, getPublishedPostSlugs, getRelatedPosts } from '@/lib/blog-utils';
import { type Metadata, type NextPage } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link'; // For breadcrumbs or related posts later
import Image from 'next/image'; // Import Next.js Image component
import { SupplementOffers } from '@/components/common/supplement-offers';
import { CasinoOffersWidget } from '@/components/common/casino-offers-widget';
import type { AffiliateLink } from '@/components/common/affiliate-link-card';
import fs from 'fs/promises'; // Uncommented
import path from 'path'; // Uncommented
import { siteStrings } from '@/lib/translations'; // Import siteStrings
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
// Removed ReactMarkdown imports from here, they are in the client component
// Removed ComponentPropsWithoutRef as it was likely for ReactMarkdown internal types
// Removed React, useRef, useEffect import

// Import the new client component and its types
import { BlogContentRenderer, type AffiliateComponentDataItem } from '@/components/blog/blog-content-renderer';
// Import the new component
import { RelatedArticleCard } from '@/components/blog/related-article-card'; // Import the new card
import { ArrowRightCircle, ArrowLeft } from 'lucide-react'; // Ensure ArrowRightCircle is imported, Add ArrowLeft
import { JoinTelegramSection } from '@/components/common/join-telegram-section'; // Added import
// import { AffiliateLinkCard } from '@/components/common/affiliate-link-card'; // REMOVED

// Define a type for the keys of siteStrings.blog.authors
export type BlogAuthorId = keyof typeof siteStrings.blog.authors;

// Type guard to check if a string is a valid BlogAuthorId
function isValidBlogAuthorId(id: string): id is BlogAuthorId {
  return id === "equipo-editorial" || id === "especialista-telegram";
  // Or more dynamically, if author keys could change:
  // return Object.keys(siteStrings.blog.authors).includes(id);
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

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// AffiliateComponentDataItem is now imported

// BlogContentRenderer and its props are now imported

// Generate static paths for published posts
export async function generateStaticParams() {
  const slugs = getPublishedPostSlugs();
  return slugs;
}

// Generate metadata for each blog post
export async function generateMetadata(
  props: BlogPostPageProps
): Promise<Metadata> {
  const params = await props.params;
  const post = getPostBySlug(params.slug);

  if (!post) {
    return {
      title: siteStrings.blog?.postNotFoundTitle || "Post Not Found",
      description: siteStrings.blog?.postNotFoundDescription || "This post was not found.",
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.telegram-deutschland.de";
  const astraiaOgImage = `${siteUrl}/og-image-astraia.png`;
  const fallbackImage = `${siteUrl}/blog/blog.webp`;

  const images = [];
  if (post.featuredImage) {
    const imageUrl = post.featuredImage.startsWith('http') ? post.featuredImage : `${siteUrl}${post.featuredImage}`;
    images.push(imageUrl);
  } else {
    images.push(fallbackImage);
  }
  images.push(astraiaOgImage);

  const ogImages = images.map(img => ({ url: img }));

  let ogAuthorName = siteStrings.blog.defaultAuthorName || siteStrings.siteName;
  if (post.author?.id && siteStrings.blog.authors && isValidBlogAuthorId(post.author.id) && siteStrings.blog.authors[post.author.id]?.name) {
    ogAuthorName = siteStrings.blog.authors[post.author.id].name;
  } else if (post.author?.name) {
    ogAuthorName = post.author.name;
  }

  return {
    title: `${post.title} | ${siteStrings.siteName}`,
    description: post.excerpt,
    openGraph: {
      title: `${post.title} | ${siteStrings.siteName}`,
      description: post.excerpt,
      url: `${siteUrl}/blog/${post.slug}`,
      siteName: siteStrings.siteName,
      images: ogImages,
      type: 'article',
      publishedTime: new Date(post.publishDate).toISOString(),
      authors: [ogAuthorName],
      locale: 'de_DE',
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${post.title} | ${siteStrings.siteName}`,
      description: post.excerpt,
      images: images,
    },
    alternates: {
      canonical: `${siteUrl}/blog/${post.slug}`,
    }
  };
}

// Function to get all affiliate links from the JSON file
async function getAllAffiliateLinks(): Promise<AffiliateLink[]> {
  try {
    const filePath = path.join(process.cwd(), 'config', 'affiliate-links.json');
    const jsonData = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(jsonData);
    return data.affiliateLinks || [];
  } catch (error) {
    console.error("Failed to read or parse affiliate links:", error);
    return [];
  }
}

const BlogPostPage: NextPage<BlogPostPageProps> = async (props) => {
  const params = await props.params;
  const post = await getPostBySlug(params.slug);
  
  const currentSlug = params.slug;
  // const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.telegram-deutschland.de"; // Removed unused variable

  if (!post) {
    notFound();
  }
  
  // Determine author name for display
  let authorNameToDisplay = siteStrings.blog.defaultAuthorName;
  // let authorBio: string | undefined = undefined; // REMOVED - Unused
  // let authorImage: string | undefined = undefined; // REMOVED - Unused

  // Apply type guard here as well
  if (post.author?.id && siteStrings.blog.authors && isValidBlogAuthorId(post.author.id)) {
    const authorData = siteStrings.blog.authors[post.author.id];
    if (authorData?.name) authorNameToDisplay = authorData.name;
    // if (authorData?.bio) authorBio = authorData.bio; // REMOVED - Unused
    // authorImage = (authorData as any)?.image; // REMOVED - Unused
  } else if (post.author?.name) {
    authorNameToDisplay = post.author.name;
    // authorBio = (post.author as any)?.bio; // REMOVED - Unused
    // authorImage = (post.author as any)?.image; // REMOVED - Unused
  }

  // --- Prepare Affiliate Components for Injection ---
  const allRegularAffiliateLinks = await getAllAffiliateLinks();

  // Filter for affiliate links that have an imageUrl
  const imageAffiliateLinks = allRegularAffiliateLinks.filter(link => link.imageUrl);

  // Define ThematicButtonsSection here to capture allRegularAffiliateLinks in its closure
  const ThematicButtonsSection = () => {
    return (
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
            // Use allRegularAffiliateLinks which is in the outer scope
            const affiliateLink = allRegularAffiliateLinks.find(link => link.id === buttonConfig.targetId);
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
    );
  };


  const affiliateComponentData: AffiliateComponentDataItem[] = [
    {
      key: "weightloss-supplements-h2-1",
      title: siteStrings.blog.affiliateComponents?.specialSupplementsTitle || "Spezial-Supplemente",
      element: <SupplementOffers />,
      wrapperClass: ""
    },
    {
      key: "casino-offers-h2-2",
      title: siteStrings.blog.affiliateComponents?.exclusiveCasinoOffersTitle || "Exklusive Casino-Angebote",
      element: <CasinoOffersWidget />,
      wrapperClass: ""
    },
    {
      key: "join-telegram-h2-3",
      title: siteStrings.blog.affiliateComponents?.joinTelegramGroupsTitle || "Tritt unseren Telegram-Gruppen bei",
      element: <JoinTelegramSection overrideButtonText={siteStrings.blog.affiliateComponents?.joinTelegramButtonText || "Zugang zu Telegram-Gruppen"} />,
      wrapperClass: "flex justify-center"
    },
    {
      key: "thematic-buttons-h2-4", 
      title: siteStrings.blog.affiliateComponents?.exploreOtherOffersTitle || "Weitere Angebote entdecken",
      element: <ThematicButtonsSection />, // Using the localized ThematicButtonsSection
      wrapperClass: "" 
    }
  ];

  // --- TEMPORARY CONSOLE LOG --- 
  console.log("--- BlogPostPage Data --- Stichy");
  console.log("Slug:", params.slug);
  if (post) {
    console.log("Post Title:", post.title);
    console.log("Raw Markdown Content (first 300 chars):", post.rawMarkdownContent?.substring(0, 300));
    console.log("Accordion Data:", post.accordionData ? "Present" : "Absent");
    console.log("Author ID:", post.authorId);
    console.log("Author Name:", post.author?.name);
  } else {
    console.log("Post object is null or undefined.");
  }
  console.log("--- End BlogPostPage Data ---");
  // --- END TEMPORARY CONSOLE LOG ---

  // Check if the post is actually published before rendering
  // This is a double check, as generateStaticParams should only include published slugs
  // but direct navigation to a future-dated slug URL could bypass that.
  const postDate = new Date(post.publishDate);
  const today = new Date();
  if (postDate > today && process.env.NODE_ENV === 'production') {
      // In production, if someone guesses the URL of a future post, show 404.
      // In development, you might want to see it, so we can skip this check.
      notFound();
  }

  // Fetch related posts
  const relatedPosts = getRelatedPosts(currentSlug, post.tags || [], 3);
  // Use allRegularAffiliateLinks which is already fetched
  // const allAffiliateLinks = allRegularAffiliateLinks; 

  // Determine the image to display using the deterministic random function
  const imageIndex = getDeterministicRandomImageIndex(params.slug, 20);
  const imageToDisplay = `/blog/${imageIndex + 1}.webp`;
  const altForImage = post.featuredImage 
    ? (siteStrings.blog?.featuredImageAlt?.replace('{postTitle}', post.title) || `Featured image for ${post.title}`)
    : (siteStrings.blog?.defaultImageAlt?.replace('{postTitle}', post.title) || `Blog post - ${post.title}`);

  return (
    <div className="bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 text-gray-100 min-h-screen">
      <div className="container mx-auto px-2 sm:px-4 py-8">
        <Link href="/blog" className="mb-8 inline-flex items-center text-primary hover:underline">
          <ArrowLeft className="mr-2 h-5 w-5" />
          {siteStrings.blog?.backToBlog || "Back to Blog"}
        </Link>
        {/* Centered JoinTelegramSection at the top */}
        <div className="mb-8 flex justify-center">
          <JoinTelegramSection overrideButtonText={siteStrings.blog.affiliateComponents?.joinTelegramButtonText || "Zugang zu Telegram-Gruppen"} />
        </div>

        <article className="max-w-3xl mx-auto bg-card text-card-foreground p-6 sm:p-8 rounded-lg shadow-xl">
        
          {/* ===== NEW THEMATIC BUTTONS SECTION ===== */}
          <section className="mb-8">
            <ThematicButtonsSection />
          </section>
          {/* ===== END NEW THEMATIC BUTTONS SECTION ===== */}

          <header className="mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-4 leading-tight">{post.title}</h1>
            <div className="flex items-center text-sm text-muted-foreground mb-2">
              {post.author && post.author.image && (
                <Image
                  src={post.author.image}
                  alt={siteStrings.blog.authorImageAlt?.replace('{authorName}', post.author.name) || post.author.name}
                  width={32}
                  height={32}
                  className="rounded-full mr-3"
                />
              )}
              <span className="mr-1">{authorNameToDisplay}</span>
              <span className="mx-1">•</span>
              <span>
                {new Date(post.publishDate).toLocaleDateString("de-DE", { // Changed to de-DE
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            {post.tags && post.tags.length > 0 && (
              <div className="mt-3">
                {post.tags.map(tag => (
                  <span key={tag} className="inline-block bg-secondary text-secondary-foreground text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Featured Image Section (remains after new card section) */}
          <div className="mb-8 rounded-lg overflow-hidden shadow-lg">
            <Image 
                src={imageToDisplay} 
                alt={altForImage} 
                width={768}
                height={432}
                className="w-full h-auto object-cover max-h-[400px]"
                priority
            />
          </div>

          {/* Main Blog Content - Rendered by Client Component */}
          <section className="my-12 py-8 px-6 bg-card text-card-foreground rounded-xl shadow-lg">
            <div className="prose dark:prose-invert max-w-none text-muted-foreground text-md sm:text-lg leading-relaxed">
              <BlogContentRenderer 
                rawMarkdownContent={post.rawMarkdownContent || ''}
                affiliateComponentData={affiliateComponentData}
                imageBasedAffiliateCards={imageAffiliateLinks}
                contentKey={currentSlug}
              />
            </div>
          </section>

          {/* Accordion (FAQ) Section - Assuming FAQ title is part of markdown or handled by BlogContentRenderer */}
          {post.accordionData && post.accordionData.length > 0 && (
            <div className="mt-10">
              <h2 className="text-2xl font-semibold text-center mb-6">
                {siteStrings.blog.faqTitle || "Häufig gestellte Fragen (FAQ)"}
              </h2>
              <Accordion type="single" collapsible className="w-full">
                {post.accordionData.map((item, index) => (
                  <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger>{item.trigger}</AccordionTrigger>
                    <AccordionContent>
                      <div dangerouslySetInnerHTML={{ __html: item.contentHtml || item.content || '' }} />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}

          <hr className="my-10 border-border" />

          {/* Related Articles Section */}
          {relatedPosts && relatedPosts.length > 0 && (
            <section className="mt-12 pt-8 border-t border-border">
              <h2 className="text-2xl font-semibold text-center mb-8">
                {siteStrings.blog.relatedArticles || "Ähnliche Artikel"}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedPosts.map(relatedPost => (
                  <RelatedArticleCard 
                    key={relatedPost.slug} 
                    post={relatedPost} 
                    // Pass the random image logic if you want consistent random images
                    // Or let the card handle its own image if it has that logic
                  />
                ))}
              </div>
            </section>
          )}

          {/* <div className="text-center mt-10">
            <Link href="/blog" className="text-telegram-blue hover:underline font-semibold">
              {siteStrings.blog.backToBlog || "&larr; Zurück zum Blog"}
            </Link>
          </div> */}
        </article>
      </div>
    </div>
  );
}

export default BlogPostPage; 