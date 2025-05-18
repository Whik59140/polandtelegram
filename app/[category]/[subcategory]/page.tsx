// REMOVED @ts-nocheck
import { AffiliateLinkCard } from '@/components/common/affiliate-link-card';
import { SupplementOffers } from '@/components/common/supplement-offers';
import { CasinoOffersWidget } from '@/components/common/casino-offers-widget';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import affiliateLinksData from '@/config/affiliate-links.json';
import { JoinTelegramSection } from '@/components/common/join-telegram-section';
import { siteStrings, getSubcategorySlug, subcategoryList } from '@/lib/translations';
import type { SubcategoryKey } from '@/lib/slug-definitions';
import { slugToCategoryKey, subcategorySlugToKeyMap } from '@/lib/slug-map';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRightCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { getSubcategoryContent as fetchSubcategoryContent } from '@/lib/content-loader';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { type ComponentPropsWithoutRef } from 'react';

// NEW IMPORTS FOR BLOG ARTICLES
import { getPublishedPosts } from '@/lib/blog-utils';
import { RelatedArticleCard } from '@/components/blog/related-article-card';
import type { BlogFrontmatter } from '@/types/blog';

// Define CONTENT_LANG - REMOVED
// const CONTENT_LANG = process.env.NEXT_PUBLIC_CONTENT_LANGUAGE || 'spanish';

// Define ParentCategorySlug locally
export type ParentCategorySlug = (typeof siteStrings.slugs.parentCategories)[keyof typeof siteStrings.slugs.parentCategories];

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

// REMOVED Unused FAQItem interface
// interface FAQItem {
//   question: string;
//   answer: string;
// }

// Renamed validParentCategorySlugsList to validCategorySlugsList for clarity
const validCategorySlugsList = Object.values(siteStrings.slugs.parentCategories) as ParentCategorySlug[];

// Removed local spanishSubcategorySlugToKeyMap; will use imported subcategorySlugToKeyMap

// Renaming PageProps to SubcategoryPageProps and adjusting params.category type
interface SubcategoryPageProps {
  params: Promise<{ // Changed to Promise
    category: ParentCategorySlug;
    subcategory: string;
  }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined } | undefined>; // Changed to Promise and made the promise itself optional
}

interface GenerateMetadataProps {
  params: Promise<{ // Changed to Promise
    category: ParentCategorySlug; 
    subcategory: string;
  }>;
}

export async function generateStaticParams() {
  const params: { category: ParentCategorySlug; subcategory: string }[] = [];
  
  // Use renamed validCategorySlugsList
  for (const categorySlug of validCategorySlugsList) {
    for (const subcatKey of subcategoryList) {
      const subSlug = getSubcategorySlug(subcatKey); // This now correctly gets the global slug
      if (subSlug) {
        params.push({
          category: categorySlug,
          subcategory: subSlug,
        });
      }
    }
  }
  return params;
}

// Renamed helper to findSubcategoryKeyBySlug and use imported subcategorySlugToKeyMap
function findSubcategoryKeyBySlug(slug: string): SubcategoryKey | undefined {
  return subcategorySlugToKeyMap[slug] as SubcategoryKey | undefined;
}

export async function generateMetadata(
  props: GenerateMetadataProps,
): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) {
    console.error("FATAL ERROR: NEXT_PUBLIC_BASE_URL environment variable is not set. This is required for metadata generation in [category]/[subcategory]/page.tsx.");
    throw new Error("FATAL ERROR: NEXT_PUBLIC_BASE_URL environment variable is not set.");
  }
  
  const params = await props.params;
  const { category: parentCategorySlug, subcategory: subcategorySlug } = params;

  // Use renamed slugToCategoryKey and findSubcategoryKeyBySlug
  const parentKey = slugToCategoryKey[parentCategorySlug];
  const subcategoryKey = findSubcategoryKeyBySlug(subcategorySlug);

  if (!parentKey || !subcategoryKey || !siteStrings.categories[parentKey] || !siteStrings.subcategories[subcategoryKey]) {
    return {
      title: `${siteStrings.dynamicPages.notFoundTitle} | ${siteStrings.siteName}`,
      description: siteStrings.dynamicPages.notFoundDescription,
      robots: { index: false, follow: false },
    };
  }

  const parentCategoryName = siteStrings.categories[parentKey]?.title || parentKey;
  const subcategoryName = siteStrings.subcategories[subcategoryKey] || subcategoryKey;

  const title = siteStrings.dynamicPages.subcategoryPageTitle
    .replace("{subcategoryName}", subcategoryName)
    .replace("{categoryName}", parentCategoryName)
    .replace("{siteName}", siteStrings.siteName);

  const description = siteStrings.dynamicPages.subcategoryPageMetaDescription
    .replace("{subcategoryName}", subcategoryName)
    .replace("{categoryName}", parentCategoryName)
    .replace("{siteName}", siteStrings.siteName);
    
  const pageUrl = `${baseUrl}/${parentCategorySlug}/${subcategorySlug}`;

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: siteStrings.siteName,
      type: 'website',
      locale: process.env.NEXT_PUBLIC_OG_LOCALE || 'en_US',
    },
  };
}

function getCategoryOrder(tags: string[]): number {
  if (tags.includes('dating')) return 1;
  if (tags.includes('supplement') || tags.includes('nutra')) return 2;
  if (tags.includes('casino')) return 3;
  return 4; 
}

function getRandomPosts(posts: BlogFrontmatter[], count: number): BlogFrontmatter[] {
  if (!posts || posts.length === 0) return [];
  const shuffled = [...posts].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

const SubcategoryPage = async (props: SubcategoryPageProps) => {
  if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_OG_LOCALE) {
    console.warn("WARN: NEXT_PUBLIC_OG_LOCALE is not set. OpenGraph locale in [category]/[subcategory]/page.tsx will default to 'en_US'. Consider setting this in your .env file (e.g., NEXT_PUBLIC_OG_LOCALE=es_ES).");
  }

  const pageBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || "/";
  if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_BASE_URL) {
    console.warn("WARN: NEXT_PUBLIC_BASE_URL is not set. Breadcrumb links in [category]/[subcategory]/page.tsx will use relative paths.");
  }

  const params = await props.params;
  const currentCategorySlug = params.category;
  const currentSubcategorySlug = params.subcategory;

  if (!validCategorySlugsList.includes(currentCategorySlug)) {
    notFound();
  }

  const categoryKey = slugToCategoryKey[currentCategorySlug];
  const subcategoryKey = findSubcategoryKeyBySlug(currentSubcategorySlug);

  if (!categoryKey || !subcategoryKey || !siteStrings.categories[categoryKey] || !siteStrings.subcategories[subcategoryKey]) {
    notFound();
  }

  const categoryName = siteStrings.categories[categoryKey]?.title || categoryKey;
  const subcategoryName = siteStrings.subcategories[subcategoryKey] || subcategoryKey;

  // Use the new centralized content loader
  const aiContent = await fetchSubcategoryContent(currentCategorySlug, currentSubcategorySlug);

  // Fallback title and description if AI content is not available or doesn't have them
  const pageTitle = aiContent?.title || siteStrings.dynamicPages.subcategoryPageTitle
    .replace("{subcategoryName}", subcategoryName)
    .replace("{categoryName}", categoryName);

  const pageDescriptionFromTranslations = siteStrings.dynamicPages.subcategoryPageDescription
    .replace('{subcategoryName}', subcategoryName)
    .replace('{categoryName}', categoryName)
    .replace('{siteName}', siteStrings.siteName);

  // The detailed description and FAQs should come directly from aiContent
  const detailedDescription = aiContent?.detailedDescription;
  const faqTitle = aiContent?.faqTitle;
  const faqs = aiContent?.faqs || [];

  const allAffiliateLinks: AffiliateLink[] = affiliateLinksData.affiliateLinks;
  allAffiliateLinks.sort((a, b) => {
    const orderA = getCategoryOrder(a.tags || []);
    const orderB = getCategoryOrder(b.tags || []);
    return orderA - orderB;
  });
  const visibleAffiliateLinks = allAffiliateLinks.filter((link: AffiliateLink) => !!link.imageUrl);

  const otherSubcategories = subcategoryList
    .filter(key => key !== subcategoryKey)
    .map(key => ({
      key,
      name: siteStrings.subcategories[key],
      href: `/${currentCategorySlug}/${getSubcategorySlug(key)}`, // getSubcategorySlug should provide the global slug
    }))
    .sort(() => 0.5 - Math.random())
    .slice(0, 8);

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
        name: categoryName,
        item: `${pageBaseUrl.endsWith('/') ? pageBaseUrl.slice(0, -1) : pageBaseUrl}/${currentCategorySlug}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: subcategoryName,
        item: `${pageBaseUrl.endsWith('/') ? pageBaseUrl.slice(0, -1) : pageBaseUrl}/${currentCategorySlug}/${currentSubcategorySlug}`,
      },
    ],
  };
  
  const allPosts = getPublishedPosts() as BlogFrontmatter[]; 
  const randomBlogArticles = getRandomPosts(allPosts, 3);

  const customRenderers: Partial<ComponentPropsWithoutRef<typeof ReactMarkdown>['components']> = {
    a: ({ ...props }) => { 
      if (props.href && typeof props.href === 'string' && props.href.startsWith('/')) {
        return <Link href={props.href} {...props} className="text-telegram-blue underline font-semibold hover:text-telegram-blue">{props.children}</Link>;
      }
      return <a {...props} target="_blank" rel="noopener noreferrer" className="text-telegram-blue underline font-semibold hover:text-telegram-blue">{props.children}</a>;
    },
  };

  const mainFaqEntities = faqs && faqs.length > 0 
    ? faqs.map(faq => ({
        "@type": "Question" as const,
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer" as const,
          "text": faq.answer 
        }
      })) 
    : undefined;

  const faqStructuredData = mainFaqEntities ? {
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
        <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-start">
            <div className="w-full lg:w-auto lg:flex-shrink-0">
            <SupplementOffers />
            </div>
            <div className="w-full lg:flex-grow">
            <CasinoOffersWidget />
            </div>
        </div>

        <div className="my-8 flex justify-center">
            <JoinTelegramSection 
            category={categoryName} 
            subcategory={subcategoryName} 
            />
        </div>

        <section className="my-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {pageTitle}
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            {pageDescriptionFromTranslations}
          </p>
        </section>

        {visibleAffiliateLinks.length > 0 && (
            <section className="my-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-primary text-center mb-8 sm:mb-10">
                {siteStrings.home.affiliateOffersTitle}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {visibleAffiliateLinks.map((link: AffiliateLink) => (
                <AffiliateLinkCard key={link.id} link={link} />
                ))}
            </div>
            </section>
        )}
        
        {randomBlogArticles.length > 0 && (
            <section className="my-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-primary text-center mb-8 sm:mb-10">
                {siteStrings.home.recommendedArticlesTitle || "Artículos de blog recomendados"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {randomBlogArticles.map((post) => (
                <RelatedArticleCard key={post.slug} post={post as BlogFrontmatter} />
                ))}
            </div>
            </section>
        )}

        <section className="my-14 sm:my-16 md:my-20">
            <div className="flex flex-wrap justify-center items-stretch gap-4 md:gap-6">
            {[
              { label: siteStrings.home.thematicButtons.liveWebcams, targetId: "cam" },
              { label: siteStrings.home.thematicButtons.sexMeetings, targetId: "to-fuck" },
              { label: siteStrings.home.thematicButtons.gayMeetings, targetId: "gay" },
              { label: siteStrings.home.thematicButtons.transMeetings, targetId: "trans" },
              { label: siteStrings.home.thematicButtons.seriousDates, targetId: "-woman" },
            ].map(buttonConfig => {
              const affiliateLink = allAffiliateLinks.find(link => link.id === buttonConfig.targetId);
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

        {detailedDescription && detailedDescription !== siteStrings.dynamicPages.subcategoryDetailedContentPlaceholder
            .replace('{subcategoryName}', subcategoryName)
            .replace('{categoryName}', categoryName) && (
            <section className="my-12 py-8 px-6 bg-card text-card-foreground rounded-xl shadow-lg">
                <div className="prose dark:prose-invert max-w-none text-muted-foreground text-md sm:text-lg leading-relaxed">
                <ReactMarkdown
                    rehypePlugins={[rehypeRaw]}
                    remarkPlugins={[remarkGfm]}
                    components={customRenderers}
                >
                    {detailedDescription}
                </ReactMarkdown>
                </div>
            </section>
        )}

        {faqs && faqs.length > 0 && !(faqs.length === 1 && faqs[0].question.includes("Placeholder")) && (
            <section className="my-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-primary text-center mb-8 sm:mb-10">
                {faqTitle || siteStrings.dynamicPages.faqTitle}
            </h2>
            <div className="max-w-3xl mx-auto">
                <Accordion type="single" collapsible className="w-full">
                {faqs.map((item, index) => (
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

        {otherSubcategories.length > 0 && (
            <section className="my-12 py-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <h2 className="text-2xl sm:text-3xl font-semibold text-primary text-center mb-8 sm:mb-10">
                {siteStrings.dynamicPages.exploreOtherSubcategoriesTitle.replace("{categoryName}", categoryName)}
            </h2>
            <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 px-4">
                {otherSubcategories.map((subcat) => (
                <Link
                    key={subcat.key}
                    href={subcat.href}
                    className="group inline-block px-4 py-2 sm:px-5 sm:py-2.5 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                >
                    <span className="text-sm sm:text-base font-medium">{subcat.name}</span>
                </Link>
                ))}
            </div>
            </section>
        )}
      </div>
    </>
  );
};

export default SubcategoryPage;


