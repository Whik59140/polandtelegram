import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Footer } from '@/components/common/footer';
import { Header } from '@/components/common/header';
import { FloatingChatButton } from '@/components/common/floating-chat-button';
import { ThemeProvider } from "@/components/common/theme-provider";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { siteStrings } from "@/lib/translations";

// Ensures BASE_URL is consistently used and configurable via environment variables
const appBaseUrl = process.env.NEXT_PUBLIC_BASE_URL;
if (!appBaseUrl) {
  // For metadataBase, a valid URL is critical. Fail build if not set.
  console.error("FATAL ERROR: NEXT_PUBLIC_BASE_URL environment variable is not set. This is required for metadataBase in app/layout.tsx.");
  throw new Error("FATAL ERROR: NEXT_PUBLIC_BASE_URL environment variable is not set. Cannot proceed with build.");
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Using siteStrings for a more dynamic title and description based on language
  title: `${siteStrings.siteName} - ${siteStrings.defaultPageTitleSuffix}`,
  description: siteStrings.siteDescription, // Main site description from translations
  metadataBase: new URL(appBaseUrl),
  openGraph: {
    type: 'website',
    locale: process.env.NEXT_PUBLIC_OG_LOCALE || 'en_US', // Use environment variable with fallback
    url: appBaseUrl,
    siteName: siteStrings.siteName,
    // OG title and description can be more specific or same as main
    title: `${siteStrings.siteName} - ${siteStrings.defaultPageTitleSuffix}`,
    description: siteStrings.siteDescription, 
    // images: [ 
    //   {
    //     url: '/default-og-image.png', 
    //     width: 1200,
    //     height: 630,
    //     alt: siteStrings.siteName,
    //   },
    // ],
  },
  // Other metadata fields (twitter, icons, alternates) can also leverage siteStrings if applicable
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_OG_LOCALE) {
    console.warn("WARN: NEXT_PUBLIC_OG_LOCALE is not set. OpenGraph locale in app/layout.tsx will default to 'en_US'. Consider setting this in your .env file (e.g., NEXT_PUBLIC_OG_LOCALE=es_ES).");
  }

  const webSiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteStrings.siteName,
    url: appBaseUrl,
    description: siteStrings.siteDescription,
  };

  return (
    <html lang={siteStrings.htmlLang}> {/* Rely solely on translation */}
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          <FloatingChatButton />
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
