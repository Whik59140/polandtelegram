import { siteStrings } from '@/lib/translations';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: siteStrings.aboutPage.metaTitle,
    description: siteStrings.aboutPage.metaDescription,
    openGraph: {
      title: siteStrings.aboutPage.metaTitle,
      description: siteStrings.aboutPage.metaDescription,
      url: '/about',
      siteName: siteStrings.siteName,
      locale: 'de_DE',
      type: 'article', // 'article' can be suitable for content pages
    },
  };
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto px-4 py-10 sm:py-12 md:py-16">
        <article className="max-w-3xl mx-auto bg-card text-card-foreground p-6 sm:p-8 rounded-xl shadow-lg">
          <header className="mb-8 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-primary">
              {siteStrings.aboutPage.title}
            </h1>
          </header>
          <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
            {siteStrings.aboutPage.paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </article>
      </main>
    </div>
  );
} 