import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import casinoOffersData from '@/config/casino-offers.json';
import Link from 'next/link';

interface CasinoOffer {
  id: string;
  name: string;
  logoUrl: string;
  affiliateUrl: string;
  bonusOffer: string;
  vpnInfo: string;
}

interface CasinoOffersProps {
  title?: string;
  customOffers?: CasinoOffer[];
}

export function CasinoOffers({ 
  title = "�� Offerte Casinò e Scommesse Top 🌟",
  customOffers
}: CasinoOffersProps) {
  const offers: CasinoOffer[] = customOffers || casinoOffersData;

  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-4 mb-8 shadow-lg">
        <h2 className="text-center text-white font-bold text-xl md:text-2xl">
          {title}
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {offers.map((offer) => (
          <div 
            key={offer.id} 
            className="relative bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group flex flex-col"
          >
            {offer.name === "BC Game" && (
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-10">
                <span className="inline-flex items-center px-4 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-red-600 via-pink-600 to-purple-700 text-white shadow-lg animate-pulse">
                  🔥 Miglior Affare 🔥
                </span>
              </div>
            )}
            
            <div className="p-6 flex flex-col h-full">
              <div className="flex justify-center items-center mb-6 pt-3">
                <div className="h-16 w-32 relative">
                  <Image 
                    src={offer.logoUrl} 
                    alt={`${offer.name} logo`}
                    width={128}
                    height={64}
                    className="object-contain"
                  />
                </div>
              </div>
              
              <div className="text-center mb-6">
                <p className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-[length:200%_auto] bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 animate-shimmer group-hover:scale-110 transition-transform duration-300">
                  {offer.bonusOffer.replace(/BONUS/i, '').trim()}
                </p>
                <p className="text-2xl md:text-3xl font-bold text-orange-500 mt-1">
                  BONUS
                </p>
              </div>
              
              <div className="mt-auto">
                <Link 
                  href={offer.affiliateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-lg w-full 
                    transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-1 flex items-center justify-center text-lg mb-4 
                    animate-pulse hover:animate-none"
                >
                  OTTIENI BONUS
                  <ExternalLink className="ml-2 h-5 w-5" />
                </Link>
                
                <div className="mt-1 p-2 bg-gray-50 rounded-lg border border-gray-100 text-xs">
                  <div className="flex items-center justify-center text-gray-600">
                    <svg className="h-5 w-5 text-amber-500 mr-1.5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 6c1.65 0 3 1.35 3 3s-1.35 3-3 3-3-1.35-3-3 1.35-3 3-3z" />
                    </svg>
                    <span>
                      VPN necessario
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
} 