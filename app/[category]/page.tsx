import { AffiliateLinkCard } from '@/components/common/affiliate-link-card';
import { SupplementOffers } from '@/components/common/supplement-offers';
import { CasinoOffersWidget } from '@/components/common/casino-offers-widget';
import { JoinTelegramSection } from '@/components/common/join-telegram-section';
import affiliateLinksData from '@/config/affiliate-links.json';
import { siteStrings, getSubcategorySlug } from '@/lib/translations';
import type { SubcategoryKey } from '@/lib/slug-definitions';
import { subcategoryEmojiMap } from '@/lib/emoji-map';
import { slugToCategoryKey } from '@/lib/slug-map';
import type { Metadata, NextPage } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ComponentPropsWithoutRef } from 'react';
import { ArrowRightCircle } from 'lucide-react';

// New imports for AI content
import { getCategoryContent } from '@/lib/content-loader';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// NEW IMPORTS FOR BLOG ARTICLES
import { getPublishedPosts } from '@/lib/blog-utils';
import { RelatedArticleCard } from '@/components/blog/related-article-card';
import type { BlogFrontmatter } from '@/types/blog'; // Ensure this type matches what getPublishedPosts returns and RelatedArticleCard expects

// Define customRenderers at the module level
const customRenderers: Partial<ComponentPropsWithoutRef<typeof ReactMarkdown>['components']> = {
  a: ({ href, children, ...props }) => {
    if (href && typeof href === 'string') {
      // Check if it's an external link
      const isExternal = href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:') || href.startsWith('tel:');
      
      if (isExternal) {
        // External link: open in new tab
        return <a href={href} {...props} target="_blank" rel="noopener noreferrer" className="text-telegram-blue underline font-semibold hover:text-telegram-blue-light">{children}</a>;
      } else {
        // Internal link: ensure it's root-relative and use Next.js Link
        const internalHref = href.startsWith('/') ? href : `/${href.startsWith('./') ? href.substring(2) : href}`;
        return <Link href={internalHref} {...props} className="text-telegram-blue underline font-semibold hover:text-telegram-blue-light">{children}</Link>;
      }
    }
    // Fallback for unusual cases (e.g., no href)
    // Consider if a non-clickable span or just children should be rendered if href is missing.
    // For now, keeping a link-like structure but it might be non-functional.
    return <span {...props} className="text-telegram-blue underline font-semibold hover:text-telegram-blue-light">{children}</span>; // Changed to span if no href
  },
  p: ({ children, ...props }) => <p {...props} className="mb-3 text-base leading-relaxed">{children}</p>,
  ul: ({ children, ...props }) => <ul {...props} className="list-disc pl-6 mb-3 text-base leading-relaxed">{children}</ul>,
  ol: ({ children, ...props }) => <ol {...props} className="list-decimal pl-6 mb-3 text-base leading-relaxed">{children}</ol>,
  li: ({ children, ...props }) => <li {...props} className="mb-1">{children}</li>,
  h1: ({ children, ...props }) => <h1 {...props} className="text-3xl font-bold mb-4 text-primary">{children}</h1>,
  h2: ({ children, ...props }) => <h2 {...props} className="text-2xl font-semibold mb-3 text-primary">{children}</h2>,
  h3: ({ children, ...props }) => <h3 {...props} className="text-xl font-semibold mb-3 text-primary">{children}</h3>,
  // Add other custom renderers as needed
};

// Type definitions
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

interface SubcategoryDisplayItem {
  key: SubcategoryKey;
  name: string;
  href: string;
  icon?: string;
}

interface CategoryPageProps {
  params: Promise<{
    category: string; // This should match your directory name `[category]`
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Derive valid slugs and parent category keys directly from translations
// const validParentCategorySlugs = Object.values(siteStrings.slugs.parentCategories); // Removed as it's only used as a type
export type ParentCategorySlug = (typeof siteStrings.slugs.parentCategories)[keyof typeof siteStrings.slugs.parentCategories]; // Simplified type derivation
export type ParentCategoryKey = keyof typeof siteStrings.slugs.parentCategories;

// Helper function to determine category order (same as on home page)
function getCategoryOrder(tags: string[]): number {
  if (tags.includes('dating')) return 1;
  if (tags.includes('supplement') || tags.includes('nutra')) return 2;
  if (tags.includes('casino')) return 3;
  return 4; // Other categories last
}

const validCategorySlugs: ParentCategorySlug[] = Object.values(siteStrings.slugs.parentCategories);

export async function generateStaticParams() {
  return validCategorySlugs.map((categorySlug) => ({ category: categorySlug }));
}

export async function generateMetadata(
  props: CategoryPageProps,
): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) {
    console.error("FATAL ERROR: NEXT_PUBLIC_BASE_URL environment variable is not set. This is required for metadata generation in [category]/page.tsx.");
    throw new Error("FATAL ERROR: NEXT_PUBLIC_BASE_URL environment variable is not set.");
  }

  const params = await props.params;
  const parentCategorySlug = params.category as ParentCategorySlug;
  const parentKey = slugToCategoryKey[parentCategorySlug] as ParentCategoryKey | undefined;

  if (!parentKey || !siteStrings.categories[parentKey]) {
    return {
      title: `${siteStrings.dynamicPages.notFoundTitle || 'Categoría no encontrada'} | ${siteStrings.siteName}`,
      description: siteStrings.dynamicPages.notFoundDescription || "La categoría que busca no está disponible.",
    };
  }

  const categoryStrings = siteStrings.categories[parentKey];
  const pageUrl = `${baseUrl}/${parentCategorySlug}`;

  return {
    title: categoryStrings.metaTitle || `${categoryStrings.title} | ${siteStrings.siteName}`,
    description: categoryStrings.metaDescription,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: categoryStrings.metaTitle || `${categoryStrings.title} | ${siteStrings.siteName}`,
      description: categoryStrings.metaDescription,
      url: pageUrl,
      siteName: siteStrings.siteName,
      type: 'website',
      locale: process.env.NEXT_PUBLIC_OG_LOCALE || 'en_US', // Use environment variable with fallback
    },
  };
}

// Helper function to get N random items from an array
function getRandomPosts(posts: BlogFrontmatter[], count: number): BlogFrontmatter[] {
  if (!posts || posts.length === 0) return [];
  const shuffled = [...posts].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

const CategoryPage: NextPage<CategoryPageProps> = async (props) => {
  if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_OG_LOCALE) {
    console.warn("WARN: NEXT_PUBLIC_OG_LOCALE is not set. OpenGraph locale in [category]/page.tsx will default to 'en_US'. Consider setting this in your .env file (e.g., NEXT_PUBLIC_OG_LOCALE=es_ES).");
  }

  const pageBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || "/"; // Use "/" as fallback for client-side links
  if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_BASE_URL) {
    console.warn("WARN: NEXT_PUBLIC_BASE_URL is not set. Breadcrumb links in [category]/page.tsx will use relative paths.");
  }

  const params = await props.params;
  const currentCategorySlug = params.category as ParentCategorySlug;

  if (!(validCategorySlugs as string[]).includes(currentCategorySlug)) {
    notFound();
  }
  const categoryKey = slugToCategoryKey[currentCategorySlug] as ParentCategoryKey | undefined;

  if (!categoryKey || !siteStrings.categories[categoryKey]) {
    notFound();
  }
  const categoryTranslations = siteStrings.categories[categoryKey];

  if (!categoryTranslations) { 
    notFound(); 
  }

  const aiContent = await getCategoryContent(currentCategorySlug);
  const { title: pageContentTitle } = categoryTranslations;
  const shortIntroDescription = categoryTranslations.description;
  const { subcategoriesSectionTitle, subcategories: subcategoryNameMap } = siteStrings;

  // --- START: Logic for Other Categories Links ---
  const allCategorySlugs: ParentCategorySlug[] = Object.values(siteStrings.slugs.parentCategories);
  const otherCategorySlugs = allCategorySlugs.filter(slug => slug !== currentCategorySlug);
  
  const shuffledOtherCategorySlugs = [...otherCategorySlugs].sort(() => 0.5 - Math.random());
  const randomOtherCategories = shuffledOtherCategorySlugs.slice(0, 5).map(slug => {
    const key = slugToCategoryKey[slug] as ParentCategoryKey | undefined;
    if (!key || !siteStrings.categories[key]) {
        return { slug, title: slug };
    }
    return {
      slug,
      title: siteStrings.categories[key]?.title || slug,
    };
  });
  // --- END: Logic for Other Categories Links ---

  // Breadcrumb Schema Data
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: siteStrings.breadcrumbs.home,
        item: pageBaseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: categoryTranslations.title,
        item: `${pageBaseUrl.endsWith('/') ? pageBaseUrl.slice(0, -1) : pageBaseUrl}/${currentCategorySlug}`,
      },
    ],
  };

  const allAffiliateLinks: AffiliateLink[] = affiliateLinksData.affiliateLinks;
  allAffiliateLinks.sort((a, b) => {
    const orderA = getCategoryOrder(a.tags || []);
    const orderB = getCategoryOrder(b.tags || []);
    return orderA - orderB;
  });
  const visibleAffiliateLinks = allAffiliateLinks.filter((link: AffiliateLink) => !!link.imageUrl);
  const subcategoryItems: SubcategoryDisplayItem[] = (Object.keys(subcategoryNameMap) as SubcategoryKey[]).map((key) => {
    const emoji = subcategoryEmojiMap[key] || '🔷';
    const subcatName = subcategoryNameMap[key];
    const parentCategoryName = pageContentTitle;
    const displayName = `${emoji} ${subcatName} ${parentCategoryName} 🔵`;
    return {
      key,
      name: displayName,
      href: `/${currentCategorySlug}/${getSubcategorySlug(key)}`,
    };
  });
  const allPosts = getPublishedPosts() as BlogFrontmatter[]; 
  const randomBlogArticles = getRandomPosts(allPosts, 3);

  // --- Prepare FAQ JSON-LD Structured Data (if aiContent.faqs exists) ---
  const mainFaqEntities = aiContent?.faqs && aiContent.faqs.length > 0 
    ? aiContent.faqs.map(faq => ({
        "@type": "Question" as const,
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer" as const,
          "text": faq.answer 
        }
      })) 
    : undefined;

  const faqStructuredData: {
    "@context": "https://schema.org";
    "@type": "FAQPage";
    mainEntity?: Array<{
      "@type": "Question";
      name: string;
      acceptedAnswer: {
        "@type": "Answer";
        text: string;
      };
    }>;
  } | null = mainFaqEntities ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: mainFaqEntities
  } : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqStructuredData && (
        <script 
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
        />
      )}
    <div className="container mx-auto px-4 py-8">
      {/* Combined Offers Strip */}
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="w-full lg:w-auto lg:flex-shrink-0">
          <SupplementOffers />
        </div>
        <div className="w-full lg:flex-grow">
          <CasinoOffersWidget />
        </div>
      </div>

      {/* Centered JoinTelegramSection */}
      <div className="my-8 flex justify-center">
        <JoinTelegramSection category={pageContentTitle} />
      </div>

      <section className="my-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {pageContentTitle}
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
          {shortIntroDescription} {/* Display the original short description here */}
        </p>
      </section>

      {/* Affiliate Link Cards Section (MOVED UP & SORTED) */}
      {visibleAffiliateLinks.length > 0 && ( // Check if there are links to display
        <section className="my-12">
          <h2 className="text-2xl sm:text-3xl font-semibold text-primary text-center mb-8 sm:mb-10">
            {siteStrings.home.affiliateOffersTitle} {/* Assuming you want the same title as home */}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {visibleAffiliateLinks.map((link: AffiliateLink) => (
              <AffiliateLinkCard key={link.id} link={link} />
            ))}
          </div>
        </section>
      )}

      {/* NEW: Random Blog Articles Section */}
      {randomBlogArticles.length > 0 && (
        <section className="my-12">
          <h2 className="text-2xl sm:text-3xl font-semibold text-primary text-center mb-8 sm:mb-10">
            {siteStrings.dynamicPages.recommendedArticlesTitle}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {randomBlogArticles.map((post) => (
              <RelatedArticleCard key={post.slug} post={post as BlogFrontmatter} />
            ))}
          </div>
        </section>
      )}

      {/* ===== THEMATIC BUTTONS SECTION (Adapted from Home Page) ===== */}
      <section className="my-14 sm:my-16 md:my-20">
        <div className="flex flex-wrap justify-center items-stretch gap-4 md:gap-6">
          {[
            { label: siteStrings.home.thematicButtons.liveWebcams, targetId: "cam" },
            { label: siteStrings.home.thematicButtons.sexMeetings, targetId: "to-fuck" },
            { label: siteStrings.home.thematicButtons.gayMeetings, targetId: "gay" },
            { label: siteStrings.home.thematicButtons.transMeetings, targetId: "trans" },
            { label: siteStrings.home.thematicButtons.seriousDates, targetId: "-woman" },
          ].map(buttonConfig => {
            // Find the affiliate link using the explicit targetId
            const affiliateLink = allAffiliateLinks.find(link => link.id === buttonConfig.targetId);
            // Use a more sensible fallback like "#" or a specific page if a link is absolutely expected
            const href = affiliateLink ? affiliateLink.url : "/#"; 

            return (
              <Link key={buttonConfig.targetId} href={href} target="_blank" rel="noopener noreferrer" passHref className="flex">
                <button
                  className="w-full h-full px-4 py-3 sm:px-6 bg-gradient-to-r from-primary to-purple-600 hover:from-purple-600 hover:to-primary text-white font-semibold rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75 hover:scale-105 active:scale-95 text-sm sm:text-base flex items-center justify-center space-x-2"
                  aria-label={siteStrings.ariaLabels.thematicButtonLink.replace("{label}", buttonConfig.label)}
                >
                  <span>{buttonConfig.label}</span>
                  <ArrowRightCircle className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
                </button>
              </Link>
            );
          })}
        </div>
      </section>
      {/* ===== END THEMATIC BUTTONS SECTION ===== */}

      {/* Subcategories Section */}
      <section className="my-12 py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
          {subcategoriesSectionTitle}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4">
          {subcategoryItems.map((subcategory: SubcategoryDisplayItem) => (
            <Link
              key={subcategory.key}
              href={subcategory.href}
              className="group block p-4 bg-white dark:bg-gray-700 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out transform hover:-translate-y-1"
            >
              {subcategory.icon && (
                <div className="mb-2 text-center">
                  <Image
                    src={subcategory.icon}
                    alt={subcategory.name} // Alt text will now include the full modified name
                    width={48}
                    height={48}
                    className="mx-auto h-12 w-12 object-contain"
                  />
                </div>
              )}
              <h3 className="text-sm font-semibold text-center text-gray-800 dark:text-white group-hover:text-telegram-blue dark:group-hover:text-telegram-blue-light break-words">
                {subcategory.name}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* AI-Generated Detailed Description Section */}
      {aiContent?.detailedDescription && (
        <section className="my-12 py-8 px-6 bg-card text-card-foreground rounded-xl shadow-lg">
          {/* Display the extracted H1 from the AI content as an H2 */}
          {aiContent.title && (
            <h2 className="text-2xl sm:text-3xl font-semibold text-primary text-center mb-6">
              {aiContent.title}
            </h2>
          )}
          <div className="prose dark:prose-invert max-w-none text-muted-foreground text-md sm:text-lg leading-relaxed">
            <ReactMarkdown
              rehypePlugins={[rehypeRaw]}
              remarkPlugins={[remarkGfm]}
                components={customRenderers}
            >
              {aiContent.detailedDescription}
            </ReactMarkdown>
          </div>
        </section>
      )}

      {/* AI-Generated Category FAQ Section */}
      {aiContent && aiContent.faqs && aiContent.faqs.length > 0 && (
        <section className="my-12">
          <h2 className="text-2xl sm:text-3xl font-semibold text-primary text-center mb-8 sm:mb-10">
            {aiContent.faqTitle || siteStrings.dynamicPages.faqTitle} {/* Fallback title */}
          </h2>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {aiContent.faqs.map((item, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger className="text-left hover:no-underline text-lg font-medium">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="pt-1 pb-4">
                    <ReactMarkdown
                      rehypePlugins={[rehypeRaw]}
                      remarkPlugins={[remarkGfm]}
                        components={customRenderers}
                    >
                      {item.answer}
                    </ReactMarkdown>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      )}

        {/* START: Other Categories Section */}
        {randomOtherCategories.length > 0 && (
          <section className="my-12 py-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <h2 className="text-2xl sm:text-3xl font-semibold text-primary text-center mb-8 sm:mb-10">
              {siteStrings.dynamicPages.exploreOtherCategoriesTitle}
            </h2>
            <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 px-4">
              {randomOtherCategories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/${cat.slug}`}
                  className="group inline-block px-4 py-2 sm:px-5 sm:py-2.5 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                >
                  <span className="text-sm sm:text-base font-medium">{cat.title}</span>
                </Link>
              ))}
            </div>
          </section>
        )}
        {/* END: Other Categories Section */}

    </div>
    </>
  );
}

export default CategoryPage; 