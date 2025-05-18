'use client';

import Image from 'next/image';
import Link from 'next/link';
import { siteStrings, type AffiliateOfferId } from '@/lib/translations';
import { ArrowRightCircle } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';

export interface AffiliateLink {
  id: string;
  name: string;
  url: string;
  description: string;
  tags: string[];
  imageUrl?: string; // Optional image URL from your JSON
  isBestOffer?: boolean; // Added isBestOffer
}

interface AffiliateLinkCardProps {
  link: AffiliateLink;
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function AffiliateLinkCard({ link }: AffiliateLinkCardProps) {
  const offerTranslations = siteStrings.affiliateOffers[link.id as AffiliateOfferId];

  const displayName = offerTranslations?.name || link.name;
  const displayDescription = offerTranslations?.description || link.description;

  const { cta } = siteStrings;

  const [onlineMembers, setOnlineMembers] = useState<number>(0);

  const { minMembers, maxMembers } = useMemo(() => {
    if (link.id === "-woman") {
      return { minMembers: 1000, maxMembers: 1200 };
    }
    return { minMembers: 200, maxMembers: 400 };
  }, [link.id]);

  useEffect(() => {
    setOnlineMembers(getRandomInt(minMembers, maxMembers));
    const onlineMembersIntervalId = setInterval(() => {
      setOnlineMembers(prevMembers => {
        const change = getRandomInt(-7, 7);
        let newCount = prevMembers + change;
        if (newCount < minMembers) newCount = minMembers + getRandomInt(0,5);
        if (newCount > maxMembers) newCount = maxMembers - getRandomInt(0,5);
        return newCount;
      });
    }, getRandomInt(2500, 5000));
    return () => clearInterval(onlineMembersIntervalId);
  }, [minMembers, maxMembers]);

  return (
    <Link 
      href={link.url} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="bg-card text-card-foreground rounded-xl shadow-xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 h-full group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-75"
      aria-label={`${cta.offerAriaLabelPrefix || "Angebot"}: ${displayName}`}
    >
      {link.imageUrl && (
        <div className="relative w-full aspect-square overflow-hidden">
          <Image 
            src={link.imageUrl} 
            alt={cta.imageAltText.replace("{partnerName}", displayName)}
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            priority
          />
          {link.isBestOffer && (
            <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-md animate-badge-pulse z-10">
              {cta.bestOfferBadgeText}
            </div>
          )}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <span className="text-white font-semibold text-lg sm:text-xl flex items-center px-2 text-center">
              {cta.actionButtonText} 
            </span>
          </div>
        </div>
      )}
      <div className="p-3 sm:p-4 flex flex-col flex-grow">
        <h3 className="text-base sm:text-lg font-semibold text-primary mb-1.5 truncate group-hover:text-pink-500 transition-colors duration-300" title={displayName}>
          {displayName}
        </h3>
        <p className="text-xs text-muted-foreground mb-2 flex-grow line-clamp-2" title={displayDescription}>
          {displayDescription}
        </p>
        
        <div className="flex items-center justify-center space-x-1.5 sm:space-x-2 mb-2 sm:mb-2.5">
          <span className="text-xs sm:text-sm font-semibold bg-green-500 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full">{cta.freeTag}</span>
          <span className="text-xs sm:text-sm font-semibold bg-blue-500 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full flex flex-col sm:flex-row items-center justify-center text-center leading-tight min-h-[2.25em] sm:min-h-0">
            <span className="block sm:hidden">
              {cta.quickSignupTag.split(' ').map((word, index) => (
                <span key={index} className="block leading-tight">{word}</span>
              ))}
            </span>
            <span className="hidden sm:inline leading-tight">
              {cta.quickSignupTag}
            </span>
          </span>
        </div>

        <div className="text-xs text-muted-foreground mb-2.5 sm:mb-3 flex items-center justify-center">
          <span className="w-2 h-2 bg-green-500 rounded-full inline-block mr-1.5 animate-pulse"></span>
          {onlineMembers} {cta.membersOnlineSuffix}
        </div>

        <div className="mt-auto w-full flex items-center justify-center px-2 py-2 sm:px-3 sm:py-2.5 bg-primary group-hover:bg-pink-600 group-hover:scale-[1.02] transition-all duration-300 text-primary-foreground font-bold rounded-lg shadow-md group-hover:shadow-lg text-base animate-subtle-pulse group-hover:animate-none">
          {cta.actionButtonText}
          <ArrowRightCircle className="w-4 h-4 ml-1.5 sm:w-5 sm:h-5 sm:ml-2 transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
} 