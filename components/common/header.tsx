'use client';

import Link from 'next/link';
import { siteStrings } from '@/lib/translations';
import { Send, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) { // Tailwind's md breakpoint
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navLinks = [
    { href: "/", text: siteStrings.navigation.home },
    { href: `/${siteStrings.slugs.parentCategories.groups}`, text: siteStrings.navigation.groups },
    { href: `/${siteStrings.slugs.parentCategories.chat}`, text: siteStrings.navigation.chat },
    {
      href: "https://t.acrsmartcam.com/345641/4152?bo=2779,2778,2777,2776,2775&popUnder=true&aff_sub5=YOUR_AFFILIATE_ID",
      text: siteStrings.navigation.liveWebcam,
      isExternal: true, // Add a flag for external links
    },
    { href: `/${siteStrings.slugs.parentCategories.channels}`, text: siteStrings.navigation.channels },
    { href: `/${siteStrings.slugs.parentCategories.videos}`, text: siteStrings.navigation.videos },
    { href: "/blog", text: "Blog" }
  ];

  return (
    <header className="bg-background text-card-foreground shadow-sm sticky top-0 z-50 border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl sm:text-2xl font-semibold text-primary hover:opacity-85 transition-opacity flex items-center">
          <Send size={26} className="mr-2 text-primary" strokeWidth={1.75} /> 
          {siteStrings.logoText}
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-3 lg:space-x-5 items-center">
          {navLinks.map((link) => (
            <Link 
              key={link.href}
              href={link.href} 
              className="text-sm lg:text-base text-muted-foreground hover:text-primary font-medium transition-colors flex items-center"
              target={link.isExternal ? "_blank" : undefined}
              rel={link.isExternal ? "noopener noreferrer" : undefined}
            >
              {link.text}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-accent focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            aria-label={isMobileMenuOpen ? siteStrings.ariaLabels.closeMenu : siteStrings.ariaLabels.openMenu}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu (Dropdown) */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-t border-border shadow-lg absolute w-full top-full left-0">
          <nav className="flex flex-col space-y-1 px-2 py-3">
            {navLinks.map((link) => (
              <Link 
                key={`${link.href}-mobile`}
                href={link.href} 
                className="px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-primary hover:bg-accent flex items-center transition-colors"
                onClick={() => setIsMobileMenuOpen(false)} // Close menu on link click
                target={link.isExternal ? "_blank" : undefined}
                rel={link.isExternal ? "noopener noreferrer" : undefined}
              >
                {link.text}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
} 