import { siteStrings } from '@/lib/translations';
import { Metadata } from 'next';
import Link from 'next/link';
import { AffiliateLinkCard, type AffiliateLink } from '@/components/common/affiliate-link-card';
import { SupplementOffers } from '@/components/common/supplement-offers';
import { CasinoOffersWidget } from "@/components/common/casino-offers-widget";
import { JoinTelegramSection } from '@/components/common/join-telegram-section';
import fs from 'fs/promises';
import path from 'path';
import { getHomepageContent } from '@/lib/content-loader';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import ReactMarkdown, { type Components } from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { FAQPage, WithContext } from 'schema-dts';
// import { CasinoOffers } from "@/components/ui/casino-offers";
import { ReadableContent } from "@/components/common/readable-content";
import { type ReactNode, type ComponentPropsWithoutRef } from 'react';
import { ArrowRightCircle } from 'lucide-react';

// NEW IMPORTS FOR BLOG ARTICLES
import { getPublishedPosts } from '@/lib/blog-utils';
import { RelatedArticleCard } from '@/components/blog/related-article-card';
import type { BlogFrontmatter } from '@/types/blog';

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) {
    console.error("FATAL ERROR: NEXT_PUBLIC_BASE_URL environment variable is not set. This is required for metadata generation in app/page.tsx.");
    throw new Error("FATAL ERROR: NEXT_PUBLIC_BASE_URL environment variable is not set.");
  }

  const title = siteStrings.home.metaTitle;
  const description = siteStrings.home.metaDescription;
  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      url: baseUrl, // Use dynamic base URL
      siteName: siteStrings.siteName,
      // images: [ // Optional: Add images for Open Graph
      //   {
      //     url: '/og-image.png', // Path to your OG image
      //     width: 1200,
      //     height: 630,
      //   },
      // ],
      locale: process.env.NEXT_PUBLIC_OG_LOCALE || 'en_US', // Use environment variable with fallback
      type: 'website',
    },
    // twitter: { // Optional: Add Twitter card data
    //   card: 'summary_large_image',
    //   title: siteStrings.home.metaTitle,
    //   description: siteStrings.home.metaDescription,
    //   // site: '@yourTwitterHandle',
    //   // creator: '@creatorTwitterHandle',
    //   // images: ['/twitter-image.png'], // Path to your Twitter image
    // },
  };
}

interface CategoryCardProps {
  title: string;
  href: string;
  buttonText: string;
  emoji?: string; // Optional emoji
}

function CategoryCard({ title, href, buttonText, emoji }: CategoryCardProps) {
  return (
    <div className="bg-card text-card-foreground shadow-lg rounded-xl p-6 flex flex-col items-center text-center transition-all duration-300 hover:shadow-xl hover:scale-105 focus-within:scale-105 focus-within:shadow-xl">
      <div className="text-4xl mb-3 transition-transform duration-300 group-hover:scale-110">{emoji}</div>
      <h2 className="text-xl font-semibold text-primary mb-3 min-h-[2.5em] flex items-center justify-center">{title}</h2>
      <Link href={href} passHref className="mt-auto w-full">
        <button
          className="w-full px-5 py-2.5 bg-primary hover:bg-opacity-85 text-primary-foreground font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 hover:scale-105 active:scale-95"
        >
          {buttonText}
        </button>
      </Link>
    </div>
  );
}

async function getAffiliateLinks(): Promise<AffiliateLink[]> {
  try {
    const filePath = path.join(process.cwd(), 'config', 'affiliate-links.json');
    const jsonData = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(jsonData);
    return data.affiliateLinks || [];
  } catch (error) {
    console.error("Failed to read or parse affiliate links:", error);
    return []; // Return empty array on error
  }
}

// Helper function to get N random items from an array
function getRandomPosts(posts: BlogFrontmatter[], count: number): BlogFrontmatter[] {
  if (!posts || posts.length === 0) return [];
  const shuffled = [...posts].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export default async function Home() {
  if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_OG_LOCALE) {
    console.warn("WARN: NEXT_PUBLIC_OG_LOCALE is not set. OpenGraph locale in app/page.tsx will default to 'en_US'. Consider setting this in your .env file (e.g., NEXT_PUBLIC_OG_LOCALE=es_ES).");
  }

  const allAffiliateLinks = await getAffiliateLinks();
  const displayedAffiliateLinks = allAffiliateLinks.filter(link => link.imageUrl);
  const homepageContent = await getHomepageContent();

  // Fetch and select random blog posts
  const allPosts = getPublishedPosts() as BlogFrontmatter[];
  const randomBlogArticles = getRandomPosts(allPosts, 3);

  const faqJsonLd: WithContext<FAQPage> | null = homepageContent?.faqs && homepageContent.faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: homepageContent.faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  } : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto px-4 py-10 sm:py-12 md:py-16">
        {/* Centered JoinTelegramSection at the top */}
        <div className="mb-10 sm:mb-12 md:mb-16 flex justify-center">
          <JoinTelegramSection />
        </div>

        {/* AFFILIATE OFFERS SECTION (MOVED UP) */}
        {displayedAffiliateLinks.length > 0 && (
          <section className="mb-14 sm:mb-16 md:mb-20">
            <h2 className="text-2xl sm:text-3xl font-semibold text-primary text-center mb-8 sm:mb-10">
              {siteStrings.home.affiliateOffersTitle}
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
              {displayedAffiliateLinks.map((link) => (
                <AffiliateLinkCard key={link.id} link={link} />
              ))}
            </div>
          </section>
        )}

        {/* Combined Offers Strip */}
        <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="w-full lg:w-auto lg:flex-shrink-0">
            <SupplementOffers />
          </div>
          <div className="w-full lg:flex-grow">
            <CasinoOffersWidget />
          </div>
        </div>

        {/* Hero Section */}
        <section className="text-center mb-14 sm:mb-16 md:mb-20">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-5 text-primary">
            {siteStrings.home.title} <span className="inline-block origin-bottom-left group-hover:animate-wave">{siteStrings.countryFlag}</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            {siteStrings.home.intro}
          </p>
        </section>

        {/* Main Categories Section */}
        <section className="mb-14 sm:mb-16 md:mb-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            <CategoryCard 
              title={siteStrings.navigation.groups} 
              href={`/${siteStrings.slugs.parentCategories.groups}`}
              buttonText={siteStrings.home.groupsButton} 
              emoji="👨‍👩‍👧‍👦"
            />
            <CategoryCard 
              title={siteStrings.navigation.channels} 
              href={`/${siteStrings.slugs.parentCategories.channels}`}
              buttonText={siteStrings.home.channelsButton} 
              emoji="📢"
            />
            <CategoryCard 
              title={siteStrings.navigation.videos} 
              href={`/${siteStrings.slugs.parentCategories.videos}`}
              buttonText={siteStrings.home.videosButton} 
              emoji="🎬"
            />
            <CategoryCard 
              title={siteStrings.navigation.chat} 
              href={`/${siteStrings.slugs.parentCategories.chat}`}
              buttonText={siteStrings.home.chatButton}
              emoji="💬"
            />
          </div>
        </section>

        {/* ===== NEW THEMATIC BUTTONS SECTION ===== */}
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
              const href = affiliateLink ? affiliateLink.url : "/";

              return (
                <Link key={buttonConfig.targetId} href={href} target="_blank" rel="noopener noreferrer" passHref className="flex">
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
        {/* ===== END NEW THEMATIC BUTTONS SECTION ===== */}

        {/* NEW: Random Blog Articles Section */}
        {randomBlogArticles.length > 0 && (
          <section className="my-14 sm:my-16 md:my-20">
            <h2 className="text-2xl sm:text-3xl font-semibold text-primary text-center mb-8 sm:mb-10">
              {siteStrings.home.recommendedArticlesTitle}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {randomBlogArticles.map((post) => (
                <RelatedArticleCard key={post.slug} post={post} />
              ))}
            </div>
          </section>
        )}

        {/* AI Generated Introduction Section */}
        {homepageContent && homepageContent.detailedDescription && (
          <section className="mb-14 sm:mb-16 md:mb-20 py-8 px-6 bg-card text-card-foreground rounded-xl shadow-lg">
            {homepageContent.title && (
              <h2 className="text-2xl sm:text-3xl font-semibold text-primary text-center mb-6">
                {homepageContent.title}
              </h2>
            )}
            <ReadableContent content={homepageContent.detailedDescription} />
          </section>
        )}
        
        {/* AI Generated FAQ Section */}
        {homepageContent && homepageContent.faqs && homepageContent.faqs.length > 0 && (
          <section className="mb-14 sm:mb-16 md:mb-20">
            {faqJsonLd && (
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
              />
            )}
            {homepageContent.faqTitle && (
               <h2 className="text-2xl sm:text-3xl font-semibold text-primary text-center mb-8 sm:mb-10">
                 {homepageContent.faqTitle}
               </h2>
            )}
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="w-full">
                {homepageContent.faqs.map((item, index) => (
                  <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger className="text-left hover:no-underline text-lg font-medium py-4">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="pt-1 pb-4">
                      <ReactMarkdown
                        rehypePlugins={[rehypeRaw]}
                        remarkPlugins={[remarkGfm]}
                        components={{
                          a: ({ href, children, ...rest }: { href?: string; children?: ReactNode } & Omit<ComponentPropsWithoutRef<'a'>, 'href' | 'children'>) => (
                            <a href={href} {...rest} className="text-telegram-blue hover:underline font-semibold" target="_blank" rel="noopener noreferrer">{children}</a>
                          ),
                          p: ({ children, ...rest }: { children?: ReactNode } & Omit<ComponentPropsWithoutRef<'p'>, 'children'>) => (
                            <p {...rest} className="mb-2 last:mb-0">{children}</p>
                          ),
                          ul: ({ children, ...rest }: { children?: ReactNode } & Omit<ComponentPropsWithoutRef<'ul'>, 'children'>) => (
                            <ul {...rest} className="list-disc pl-5 mb-2">{children}</ul>
                          ),
                          li: ({ children, ...rest }: { children?: ReactNode } & Omit<ComponentPropsWithoutRef<'li'>, 'children'>) => (
                            <li {...rest} className="mb-1">{children}</li>
                          ),
                        } as Components}
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

        {/* <CasinoOffers /> */}

      </main>
      {/* The main layout.tsx should handle the global Footer */}
    </div>
  );
}
