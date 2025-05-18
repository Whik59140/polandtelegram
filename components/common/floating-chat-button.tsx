'use client';

import Link from 'next/link';
import { MessageCircle } from 'lucide-react'; 
import { siteStrings } from '@/lib/translations';

// The URL for the 'Woman' (Donna) affiliate link
const womanAffiliateLink = "https://t.mbdaad.link/345641/5528?bo=2753,2754,2755,2756&popUnder=true&aff_sub5=SF_006OG000004lmDN";

export function FloatingChatButton() {
  const buttonText = siteStrings.cta.floatingSexChatButton;

  return (
    <Link
      href={womanAffiliateLink}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-50 bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 px-5 rounded-full shadow-lg flex items-center transition-all duration-300 hover:scale-105 group"
      aria-label={buttonText}
    >
      <MessageCircle size={22} className="mr-2 transition-transform duration-300 group-hover:rotate-[15deg]" />
      {buttonText}
    </Link>
  );
} 