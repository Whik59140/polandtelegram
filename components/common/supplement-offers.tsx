'use server';

import Image from 'next/image';
import Link from 'next/link';
import { siteStrings } from '@/lib/translations';
import supplementData from '@/config/supplement-link.json';
import type { AffiliateLink } from '@/components/common/affiliate-link-card';
import { ArrowRightCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SupplementProduct extends Omit<AffiliateLink, 'tags'> {
  originalName?: string;
  translationKey?: keyof typeof siteStrings.supplementProducts;
  tags?: string[];
  discountPercentage?: number;
  currentPrice?: number;
  originalPrice?: number;
  isBestSeller?: boolean;
}

async function getSupplementProducts(): Promise<SupplementProduct[]> {
  try {
    const products: SupplementProduct[] = (supplementData as SupplementProduct[]).map(p => {
      let key: keyof typeof siteStrings.supplementProducts | undefined;
      switch (p.id) {
        case 'big-dick': key = 'bigDick'; break;
        case 'better-erection': key = 'betterErection'; break;
        case 'fat-burn': key = 'fatBurn'; break;
        case 'extreme-bulk': key = 'extremeBulk'; break;
        case 'hair-loss': key = 'hairLoss'; break;
        default: key = undefined;
      }
      return {
        ...p,
        originalName: p.name,
        translationKey: key
      };
    });
    return products.filter(product => 
      typeof product.imageUrl === 'string' && 
      product.imageUrl.startsWith('/nutra/') &&
      product.translationKey
    );
  } catch (error) {
    console.error("Failed to read or parse supplement links:", error);
    return [];
  }
}

export async function SupplementOffers() {
  const supplementProducts = await getSupplementProducts();
  const { cta, supplementProducts: supplementTranslations } = siteStrings;

  if (!supplementProducts || supplementProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-6 sm:py-8 bg-gray-100 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex overflow-x-auto space-x-4 sm:space-x-5 pb-4 pt-2">
          {supplementProducts.map((product) => {
            const translatedProductName = (product.translationKey && supplementTranslations[product.translationKey]?.name) || product.name;

            return (
              <Link
                key={product.id}
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 w-32 sm:w-40 md:w-44 group rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-75 flex flex-col items-center relative animate-pulsing-glow group-hover:animate-none"
                title={`${cta.offerPrefix || 'Angebot'} ${translatedProductName}`}
              >
                <div className="relative w-full h-40 flex items-center justify-center">
                  {product.imageUrl && (
                    <Image
                      src={product.imageUrl}
                      alt={`${cta.offerPrefix || 'Angebot'} ${translatedProductName}`}
                      width={136}
                      height={136}
                      className="object-contain group-hover:scale-105 transition-transform duration-300 p-2 sm:p-3"
                      unoptimized={true} 
                    />
                  )}
                  {product.discountPercentage && (
                    <div className={`absolute top-1.5 right-1.5 bg-red-500 text-white text-xs sm:text-sm font-bold px-2 py-1 rounded-md shadow-md animate-badge-pulse`}>
                      -{product.discountPercentage}{cta.discountSuffix}
                    </div>
                  )}
                </div>
                <div className="-mt-3 mb-1">
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="w-auto transition-transform duration-300 group-hover:scale-110"
                  >
                    {cta.clickHereButton || 'Hier klicken'}
                    <ArrowRightCircle className="ml-1.5" /> 
                  </Button>
                </div>
                <div className="p-2 pt-0 sm:p-3 sm:pt-0 w-full flex flex-col items-center text-center flex-grow">
                  {product.isBestSeller && (
                    <div className="bg-amber-400 text-amber-900 text-xs sm:text-sm font-bold px-2 py-0.5 rounded-full shadow-sm mb-1.5 inline-block animate-badge-pulse">
                      {cta.bestSellerBadgeText}
                    </div>
                  )}
                  <h3 className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-200 truncate group-hover:text-primary transition-colors duration-300 mb-1 w-full" title={translatedProductName}>
                    {translatedProductName}
                  </h3>
                  {product.originalPrice && (
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-through">
                      {cta.originalPricePrefix}: €{product.originalPrice.toFixed(2)}
                    </p>
                  )}
                  {product.currentPrice && (
                    <p className="text-base sm:text-lg font-semibold text-green-600 dark:text-green-400">
                      {cta.priceNowPrefix}: €{product.currentPrice.toFixed(2)}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
} 