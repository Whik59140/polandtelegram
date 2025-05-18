'use client';

import React, { Fragment, type ReactNode, type ComponentPropsWithoutRef } from 'react';
import Link from 'next/link';
import ReactMarkdown, { type Components } from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import { AffiliateLinkCard, type AffiliateLink } from '@/components/common/affiliate-link-card';
import { siteStrings } from '@/lib/translations';

export interface AffiliateComponentDataItem {
  key: string;
  title: string;
  element: React.ReactNode;
  wrapperClass?: string;
}

export interface BlogContentRendererProps {
  rawMarkdownContent: string | undefined;
  affiliateComponentData: AffiliateComponentDataItem[];
  imageBasedAffiliateCards?: AffiliateLink[];
  contentKey: string;
}

function createIdFromText(text: string | undefined | null): string {
  if (!text) return ''
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

interface ListItemProps extends ComponentPropsWithoutRef<'li'> {
  children?: ReactNode;
}

interface ListProps extends ComponentPropsWithoutRef<'ul'> {
  children?: ReactNode;
}

export function BlogContentRenderer({ rawMarkdownContent, affiliateComponentData, imageBasedAffiliateCards, contentKey }: BlogContentRendererProps) {
  let h2Counter = 0;

  if (!rawMarkdownContent) {
    return <p>Contenuto non disponibile.</p>;
  }

  const h2Pattern = /(^##\s+(.+?)$\n?)([\s\S]*?(?=\n##\s+|$))/gm;
  const parts: Array<{ type: 'content' | 'h2'; title?: string; value: string }> = [];
  let lastIndex = 0;
  let match;

  while ((match = h2Pattern.exec(rawMarkdownContent)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'content', value: rawMarkdownContent.substring(lastIndex, match.index) });
    }
    parts.push({ type: 'h2', title: match[2].trim(), value: match[3] || '' });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < rawMarkdownContent.length) {
    parts.push({ type: 'content', value: rawMarkdownContent.substring(lastIndex) });
  }

  if (parts.length === 0 && rawMarkdownContent) {
    parts.push({ type: 'content', value: rawMarkdownContent });
  }

  let lastH2PartIndex = -1;
  for (let i = parts.length - 1; i >= 0; i--) {
    if (parts[i].type === 'h2') {
      lastH2PartIndex = i;
      break;
    }
  }
  
  let imageCardsRendered = false;

  const commonReactMarkdownComponents: Components = {
    a: ({ children, href, ...props }: ComponentPropsWithoutRef<'a'> & { children?: ReactNode, href?: string }) => {
      if (href && (href.startsWith('/') && !href.startsWith('//'))) {
        return <Link href={href} {...props} className="text-telegram-blue underline font-semibold hover:text-telegram-blue-light">{children}</Link>;
      }
      return <a href={href} {...props} target="_blank" rel="noopener noreferrer" className="text-telegram-blue underline font-semibold hover:text-telegram-blue-light">{children}</a>;
    },
    h3: ({ children, ...props }: ComponentPropsWithoutRef<'h3'> & { children?: ReactNode }) => <h3 className="text-xl font-bold my-3" {...props}>{children}</h3>,
    p: ({ children, ...props }: ComponentPropsWithoutRef<'p'> & { children?: ReactNode }) => <p className="my-4 leading-relaxed" {...props}>{children}</p>,
    ul: ({ children, className, ...rest }: ListProps) => {
      const passProps = { className: className || "list-disc pl-5 my-4 space-y-2", ...rest };
      return <ul {...passProps}>{children}</ul>;
    },
    ol: ({ children, className, ...rest }: ListProps) => {
      const passProps = { className: className || "list-decimal pl-5 my-4 space-y-2", ...rest };
      return <ol {...passProps}>{children}</ol>;
    },
    li: ({ children, className, ...rest }: ListItemProps) => {
      const passProps = { className: className || "my-1", ...rest };
      return <li {...passProps}>{children}</li>;
    },
  };

  return (
    <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none dark:prose-invert">
      {parts.map((part, index) => {
        let affiliateSectionToInject = null;

        if (index === lastH2PartIndex && imageBasedAffiliateCards && imageBasedAffiliateCards.length > 0 && !imageCardsRendered) {
          imageCardsRendered = true;
          const imageCardGrid = (
            <section className="not-prose my-10">
              <h2 className="text-2xl sm:text-3xl font-semibold text-primary text-center mb-8">
                {siteStrings.blog?.featuredOffersTitle || "Our Top Offers"} 
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {imageBasedAffiliateCards.map((link) => (
                  <AffiliateLinkCard key={link.id} link={link} />
                ))}
              </div>
            </section>
          );
          affiliateSectionToInject = imageCardGrid;
        }

        if (part.type === 'h2') {
          h2Counter++;
          let componentAfterH2 = null;
          if (!(index === lastH2PartIndex && imageCardsRendered)) {
            const componentIndexToInject = h2Counter - 1; 
            if (componentIndexToInject < affiliateComponentData.length) {
              const compData = affiliateComponentData[componentIndexToInject];
              componentAfterH2 = (
                <section key={`injected-${compData.key}-${contentKey}-h2-${h2Counter}`} className="not-prose my-12 py-8 px-6 bg-background dark:bg-muted rounded-xl shadow-lg border border-border">
                  <h3 className="text-2xl font-semibold text-primary text-center mb-6">{compData.title}</h3>
                  <div className={compData.wrapperClass || ""}>
                    {compData.element}
                  </div>
                </section>
              );
            }
          }

          return (
            <Fragment key={`part-${index}-${contentKey}`}>
              {index === lastH2PartIndex && affiliateSectionToInject}
              
              <h2 id={createIdFromText(part.title)} className="text-2xl font-bold my-4 scroll-mt-20">{part.title}</h2>
              {part.value && (
                <ReactMarkdown
                  rehypePlugins={[rehypeRaw, rehypeSlug]}
                  remarkPlugins={[remarkGfm]}
                  components={commonReactMarkdownComponents}
                >
                  {part.value}
                </ReactMarkdown>
              )}
              {!(index === lastH2PartIndex && imageCardsRendered) && componentAfterH2}
            </Fragment>
          );
        } else { // part.type === 'content'
          return (
            <ReactMarkdown
              key={`part-${index}-${contentKey}-content`}
              rehypePlugins={[rehypeRaw, rehypeSlug]}
              remarkPlugins={[remarkGfm]}
              components={commonReactMarkdownComponents}
            >
              {part.value}
            </ReactMarkdown>
          );
        }
      })}
      {lastH2PartIndex === -1 && imageBasedAffiliateCards && imageBasedAffiliateCards.length > 0 && !imageCardsRendered && parts.length > 0 && (
        <>
          <section className="not-prose my-10">
            <h2 className="text-2xl sm:text-3xl font-semibold text-primary text-center mb-8">
              {siteStrings.blog?.featuredOffersTitle || "Our Top Offers"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {imageBasedAffiliateCards.map((link) => (
                <AffiliateLinkCard key={link.id} link={link} />
              ))}
            </div>
          </section>
          {parts.map((part, pIndex) => (
            <ReactMarkdown
              key={`part-${pIndex}-${contentKey}-fallback-content`}
              rehypePlugins={[rehypeRaw, rehypeSlug]}
              remarkPlugins={[remarkGfm]}
              components={commonReactMarkdownComponents}
            >
              {part.value}
            </ReactMarkdown>
          ))}
        </>
      )}
    </div>
  );
} 