import { siteStrings } from '@/lib/translations';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: siteStrings.privacyPage.metaTitle,
    description: siteStrings.privacyPage.metaDescription,
    openGraph: {
      title: siteStrings.privacyPage.metaTitle,
      description: siteStrings.privacyPage.metaDescription,
      url: '/privacy',
      siteName: siteStrings.siteName,
      locale: 'de_DE',
      type: 'article',
    },
  };
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto px-4 py-10 sm:py-12 md:py-16">
        <article className="max-w-3xl mx-auto bg-card text-card-foreground p-6 sm:p-8 rounded-xl shadow-lg">
          <header className="mb-8 pb-4 border-b border-border">
            <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-2">
              {siteStrings.privacyPage.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {siteStrings.privacyPage.lastUpdated}
            </p>
          </header>
          <div className="space-y-6 text-muted-foreground leading-relaxed">
            {siteStrings.privacyPage.sections.map((section, index) => (
              <section key={index} className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-semibold text-primary">
                  {section.heading}
                </h2>
                <p className="text-md">{section.content}</p>
              </section>
            ))}
          </div>
        </article>
      </main>
    </div>
  );
} 