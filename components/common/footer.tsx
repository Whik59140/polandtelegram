import Link from 'next/link';
import { siteStrings } from '@/lib/translations';

export function Footer() {
  return (
    <footer className="w-full bg-card text-card-foreground border-t border-border py-10 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Telegram Network Links */}
          {(siteStrings.footer.telegramNetworkLinks && siteStrings.footer.telegramNetworkLinks.length > 0) && (
            <div>
              <h3 className="text-lg font-semibold text-primary mb-3">{siteStrings.footer.telegramNetworkTitle}</h3>
              <ul className="space-y-2">
                {siteStrings.footer.telegramNetworkLinks.map((link) => (
                  <li key={link.name}>
                    <Link href={link.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary hover:underline text-sm transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Other Sites Links */}
          {(siteStrings.footer.otherSitesLinks && siteStrings.footer.otherSitesLinks.length > 0) && (
            <div>
              <h3 className="text-lg font-semibold text-primary mb-3">{siteStrings.footer.otherSitesTitle}</h3>
              <ul className="space-y-2">
                {siteStrings.footer.otherSitesLinks.map((link) => (
                  <li key={link.name}>
                    <Link href={link.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary hover:underline text-sm transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Optional Standard Links (e.g., About, Privacy) */}
          {(siteStrings.footer.aboutUs || siteStrings.footer.privacyPolicy) && (
             <div>
              <h3 className="text-lg font-semibold text-primary mb-3">
                {siteStrings.footer.informationTitle || "Informationen"}
              </h3> 
              <ul className="space-y-2">
                {siteStrings.footer.aboutUs && (
                  <li>
                    <Link href="/about" className="text-muted-foreground hover:text-primary hover:underline text-sm transition-colors">
                      {siteStrings.footer.aboutUs}
                    </Link>
                  </li>
                )}
                {siteStrings.footer.privacyPolicy && (
                  <li>
                    <Link href="/privacy" className="text-muted-foreground hover:text-primary hover:underline text-sm transition-colors">
                      {siteStrings.footer.privacyPolicy}
                    </Link>
                  </li>
                )}
                 {/* Add Terms, Contact here if needed following the same pattern */}
              </ul>
            </div>
          )}

          {/* Explore Topics Links */}
          {Object.keys(siteStrings.slugs.parentCategories).length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-primary mb-3">
                {siteStrings.footer.exploreTopicsTitle || "Explore Topics"}
              </h3>
              <ul className="space-y-2">
                {(Object.keys(siteStrings.slugs.parentCategories) as Array<keyof typeof siteStrings.slugs.parentCategories>).map((key) => {
                  const categoryInfo = siteStrings.categories[key];
                  const categorySlug = siteStrings.slugs.parentCategories[key];
                  if (categoryInfo && categorySlug) {
                    return (
                      <li key={key}>
                        <Link href={`/${categorySlug}`} className="text-muted-foreground hover:text-primary hover:underline text-sm transition-colors">
                          {categoryInfo.title}
                        </Link>
                      </li>
                    );
                  }
                  return null;
                })}
                {/* Add Blog link */}
                {siteStrings.navigation.blog && (
                  <li>
                    <Link href="/blog" className="text-muted-foreground hover:text-primary hover:underline text-sm transition-colors">
                      {siteStrings.navigation.blog}
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        <div className="text-center text-sm text-muted-foreground pt-8 border-t border-border">
          <p>{siteStrings.footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
} 