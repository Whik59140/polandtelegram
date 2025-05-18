'use client';

import Image from 'next/image';
import Link from 'next/link';
import casinoOffersData from '@/config/casino-offers.json';
import { ExternalLink, ShieldAlert } from 'lucide-react';
import { siteStrings } from '@/lib/translations';

interface CasinoOffer {
  id: string;
  name: string;
  logoUrl: string;
  affiliateUrl: string;
  bonusOffer: string;
  vpnInfo: string;
}

interface CasinoOfferCardProps {
  offer: CasinoOffer;
}

function CasinoOfferCard({ offer }: CasinoOfferCardProps) {
  const displayAsBestDeal = offer.name === "BC Game";
  const { casinoOffers, cta } = siteStrings;

  return (
    <div className="relative bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group flex flex-col">
      {displayAsBestDeal && (
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 z-10">
          <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-red-600 via-pink-600 to-purple-700 text-white shadow-md animate-pulse whitespace-nowrap">
            {casinoOffers.topBadge || '🔥 Top'}
          </span>
        </div>
      )}
      
      <div className="p-4 flex flex-col h-full">
        <div className="flex justify-center items-center mb-3 pt-2">
          <div className="h-12 w-24 relative">
            <Image 
              src={offer.logoUrl} 
              alt={`${offer.name} logo`}
              width={96}
              height={48}
              className="object-contain"
            />
          </div>
        </div>
        
        <div className="text-center my-2">
          <p className="text-xl md:text-2xl font-extrabold text-transparent bg-clip-text bg-[length:200%_auto] bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 animate-shimmer group-hover:scale-110 transition-transform duration-300">
            {offer.bonusOffer.replace(/BONUS/i, '').trim()}
          </p>
          <p className="text-lg font-bold text-orange-500 mt-0.5">
            BONUS
          </p>
        </div>
        
        <div className="mt-auto">
          <Link 
            href={offer.affiliateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-2.5 px-3 rounded-lg w-full transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-1 flex items-center justify-center text-sm mb-2 animate-pulse hover:animate-none"
          >
            {cta.getBonusButton || 'BONUS HOLEN'}
            <ExternalLink className="ml-1.5 h-4 w-4" />
          </Link>
          
          <div className="mt-1 p-1.5 bg-gray-50 rounded-lg border border-gray-100 text-xs">
            <div className="flex items-center justify-center">
              <ShieldAlert className="h-3.5 w-3.5 text-amber-500 mr-1 flex-shrink-0" />
              <span className="text-gray-600 text-[11px] leading-tight">
                {casinoOffers.vpnNeeded || 'VPN erforderlich'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CasinoOffersWidget() {
  const offers: CasinoOffer[] = casinoOffersData;
  const { casinoOffers } = siteStrings;

  if (!offers || offers.length === 0) {
    return null;
  }

  return (
    <div className="w-full lg:max-w-md xl:max-w-lg ml-auto">
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg shadow-md mb-4">
        <h3 className="text-center text-white font-semibold text-sm py-2">{casinoOffers.title || '🌟 Top Casino Angebote 🌟'}</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {offers.map((offer) => (
          <CasinoOfferCard key={offer.id} offer={offer} />
        ))}
      </div>
    </div>
  );
}