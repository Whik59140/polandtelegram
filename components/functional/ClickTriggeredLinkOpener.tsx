'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface ClickTriggeredLinkOpenerProps {
  links: string[];
}

export function ClickTriggeredLinkOpener({ links }: ClickTriggeredLinkOpenerProps): null {
  const currentIndexRef = useRef<number>(0);
  const [allLinksOpened, setAllLinksOpened] = useState<boolean>(false);

  const handleClick = useCallback(() => {
    if (allLinksOpened || links.length === 0) {
      return;
    }

    if (currentIndexRef.current < links.length) {
      const urlToOpen = links[currentIndexRef.current];
      window.open(urlToOpen, '_blank', 'noopener,noreferrer');
      currentIndexRef.current += 1;

      if (currentIndexRef.current >= links.length) {
        setAllLinksOpened(true);
      }
    }
  }, [allLinksOpened, links]);

  useEffect(() => {
    if (typeof window === 'undefined' || links.length === 0 || allLinksOpened) {
      return;
    }

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [handleClick, links.length, allLinksOpened]);

  return null;
} 