'use client';

import { useState, useMemo } from 'react';
import { Send, ArrowRight, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import affiliateLinksData from '@/config/affiliate-links.json';
import { siteStrings } from '@/lib/translations';

interface AffiliateLink {
  id: string;
  name: string;
  url: string;
  description?: string;
  tags?: string[];
  imageUrl?: string;
  isBestOffer?: boolean;
}

const modalPartnerConfig: { id: string; labelKey: keyof typeof siteStrings.cta.joinTelegramSection.partnerLabels }[] = [
  { id: 'gay', labelKey: 'gay' },
  { id: 'milf', labelKey: 'milf' },
  { id: 'trans', labelKey: 'trans' },
  { id: 'to-fuck', labelKey: 'toFuck' },
  { id: '-woman', labelKey: 'seriousRelationships' },
  { id: 'cam', labelKey: 'webcam' },
  { id: 'woman-60-plus', labelKey: 'grannies' },
  { id: '-woman', labelKey: 'women' },
  { id: 'girl', labelKey: 'girls' },
  { id: 'neighbors', labelKey: 'neighbors' },
];

interface JoinTelegramSectionProps {
  category?: string;
  subcategory?: string;
  overrideButtonText?: string;
}

export function JoinTelegramSection({ category, subcategory, overrideButtonText }: JoinTelegramSectionProps) {
  const [isConfirmedInModal, setIsConfirmedInModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const t = siteStrings.cta.joinTelegramSection;

  const activePartners = useMemo(() => {
    const allLinks: AffiliateLink[] = affiliateLinksData.affiliateLinks;
    return modalPartnerConfig.map(config => {
      const linkData = allLinks.find(link => link.id === config.id);
      const displayLabel = t.partnerLabels[config.labelKey] || config.labelKey;
      return {
        displayLabel: displayLabel,
        href: linkData ? linkData.url : '#',
        name: linkData ? linkData.name : displayLabel,
      };
    }).filter(partner => partner.href !== '#');
  }, [t.partnerLabels]);

  const fullButtonTextDesktop = category && subcategory
    ? (t.categorySubcategoryButtonText || "Telegram-Gruppe beitreten: {category} - {subcategory}")
        .replace('{category}', category)
        .replace('{subcategory}', subcategory)
    : (t.defaultButtonText || "Exklusiver Telegram-Gruppe beitreten");

  const buttonTextMobile = category && subcategory
    ? (t.mobileCategorySubcategoryButtonText || "Beitreten: {category} {subcategory}")
        .replace('{category}', category)
        .replace('{subcategory}', subcategory)
    : (t.mobileButtonText || "Beitreten");
  
  const modalTitle = t.modalTitle || "✨ Tritt unserer VIP-Gruppe bei! ✨";
  const modalDescription1 = t.modalDescription1 || "Schließe <strong class=\"text-sky-300\">2 einfache Schritte</strong> ab, um Zugang zur <strong class=\"text-pink-400\">EXKLUSIVEN</strong> Telegram-Gruppe zu erhalten.";
  const modalDescription2 = t.modalDescription2 || "(Dauert nur 30 Sekunden!)";
  const step1Title = t.step1Title || "SCHRITT 1: Registriere dich auf mindestens ZWEI Partnerseiten";
  const step2Title = t.step2Title || "SCHRITT 2: Bestätige die Registrierung";
  const confirmationCheckboxLabel = t.confirmationCheckboxLabel || "Ich bestätige, dass ich mich auf <strong class=\"text-pink-400\">mindestens ZWEI</strong> Partnerseiten registriert habe.";
  const goToTelegramButton = t.goToTelegramButton || "ZUM TELEGRAM-GRUPPE GEHEN!";
  const completeStepsButton = t.completeStepsButton || "Schritte oben abschließen";
  const closeButtonText = t.closeButton || "Schließen";
  const modalFooterDisclaimer = t.modalFooterDisclaimer || "Dies ist eine exklusive Gruppe. Zugang nur nach Befolgung der Anweisungen.";

  return (
    <section className="w-full bg-transparent py-8 md:py-10 flex flex-col items-center justify-center p-4 font-sans">
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="default" 
            size="lg"
            className="w-full sm:w-auto bg-[#0088cc] hover:bg-[#006b9f] text-white font-bold py-3 px-4 sm:px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base md:text-lg inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0088cc] animate-pulse hover:animate-none text-center"
          >
            <Send size={20} className="mr-2 flex-shrink-0" />
            {overrideButtonText ? (
              <span className="truncate sm:whitespace-normal">{overrideButtonText}</span>
            ) : (
              <>
                <span className="sm:hidden truncate">{buttonTextMobile}</span>
                <span className="hidden sm:inline truncate sm:whitespace-normal">{fullButtonTextDesktop}</span>
              </>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-[90vw] max-h-[90vh] sm:max-w-lg sm:max-h-[85vh] bg-gradient-to-br from-slate-900 to-gray-900 text-white p-0 rounded-2xl shadow-2xl border-telegram-blue/50 border overflow-y-auto flex flex-col">
          <DialogHeader className="px-4 pt-4 pb-3 sm:px-6 sm:pt-5 sm:pb-3 text-center flex-shrink-0">
            <DialogTitle className="text-lg sm:text-xl font-extrabold mb-1.5 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-red-400">
              {modalTitle}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-slate-300">
              <Info size={16} className="inline mr-1.5 mb-0.5 text-sky-400 flex-shrink-0" />
              <span dangerouslySetInnerHTML={{ __html: modalDescription1 }} />
              <br /> <span className="text-[11px] sm:text-xs text-slate-400" dangerouslySetInnerHTML={{ __html: modalDescription2 }} />
            </DialogDescription>
          </DialogHeader>
          
          <div className="px-4 sm:px-6 py-3 bg-white/5 overflow-y-auto flex-grow">
            <p className="text-xs sm:text-sm text-sky-200 mb-1 font-semibold">{step1Title}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-3">
              {activePartners.map((partner) => (
                <a
                  key={partner.name}
                  href={partner.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-slate-700/50 hover:bg-slate-600/70 border border-slate-600/80 text-slate-100 hover:text-white font-semibold py-2 px-2 rounded-md shadow-md hover:shadow-lg transition-all duration-250 text-[11px] sm:text-xs focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-offset-slate-900 focus:ring-sky-400 flex items-center justify-center transform hover:-translate-y-0.5 text-center"
                >
                  {partner.displayLabel}
                  <ArrowRight size={14} className="ml-auto opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-transform duration-250 flex-shrink-0" />
                </a>
              ))}
            </div>

            <p className="text-xs sm:text-sm text-sky-200 mb-1 font-semibold">{step2Title}</p>
            <div className="mb-3 flex items-center justify-center space-x-2 bg-slate-700/50 p-2 rounded-lg border border-slate-600/80">
              <input
                type="checkbox"
                id="confirmationCheckboxModalEnhanced"
                checked={isConfirmedInModal}
                onChange={() => setIsConfirmedInModal(!isConfirmedInModal)}
                className="h-5 w-5 text-sky-400 bg-slate-800 border-slate-600 rounded focus:ring-sky-500 focus:ring-offset-slate-700 cursor-pointer accent-pink-500 flex-shrink-0"
              />
              <label 
                htmlFor="confirmationCheckboxModalEnhanced" 
                className="text-xs sm:text-sm text-slate-200 select-none cursor-pointer"
                dangerouslySetInnerHTML={{ __html: confirmationCheckboxLabel }}
              />
            </div>
          </div>

          <DialogFooter className="px-4 pb-3 pt-2.5 sm:px-6 sm:pb-4 sm:pt-3 bg-slate-900/50 rounded-b-2xl flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 flex-shrink-0">
            {isConfirmedInModal ? (
              <a
                href="https://t.me/+vTRaDgOhEC82ODlk"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsModalOpen(false)}
                className="w-full sm:w-auto flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-500/90 hover:to-emerald-600/90 text-white font-bold py-2 px-4 rounded-md shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-sm sm:text-base inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-green-500/50"
              >
                <CheckCircle2 size={20} className="mr-2 flex-shrink-0" />
                {goToTelegramButton}
              </a>
            ) : (
              <Button 
                type="button"
                variant="outline"
                disabled
                className="w-full sm:w-auto flex-1 bg-slate-700 border-slate-600 text-slate-500 font-bold py-2 px-4 rounded-md shadow-md text-sm sm:text-base opacity-70 cursor-not-allowed inline-flex items-center justify-center"
              >
                 <AlertTriangle size={20} className="mr-2 flex-shrink-0" />
                 {completeStepsButton}
              </Button>
            )}
            <DialogClose asChild>
              <Button type="button" variant="ghost" className="w-full sm:w-auto text-slate-400 hover:text-slate-200 hover:bg-slate-700/60 py-2 px-4 rounded-md text-xs sm:text-sm">
                {closeButtonText}
              </Button>
            </DialogClose>
          </DialogFooter>
           <p className="px-4 pb-2.5 text-[10px] sm:text-xs text-slate-500 text-center flex-shrink-0">
             <AlertTriangle size={10} className="inline mr-1 mb-px flex-shrink-0" /> {modalFooterDisclaimer}
           </p>
        </DialogContent>
      </Dialog>
    </section>
  );
}

// Basic fadeIn animation for the Telegram button
// You might want to define this in your global CSS or tailwind.config.js for wider use
// For now, this is just a conceptual comment. Adding actual keyframes would require global CSS.
// @keyframes fadeIn {
//   from { opacity: 0; transform: translateY(10px); }
//   to { opacity: 1; transform: translateY(0); }
// }
// .animate-fadeIn { animation: fadeIn 0.5s ease-out; } 