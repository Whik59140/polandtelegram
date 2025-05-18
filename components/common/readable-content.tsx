'use client';

import { useState, useMemo, type ReactNode, type ComponentPropsWithoutRef } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { siteStrings } from '@/lib/translations';

interface ReadableContentProps {
  content: string;
  previewLength?: number;
  proseClassName?: string;
}

// Explicitly type the props for each custom renderer
// Using ComponentPropsWithoutRef to get standard HTML attributes and adding children

interface HeadingProps extends ComponentPropsWithoutRef<'h1'> { // Applicable to h1-h6
  children?: ReactNode;
  // Specific react-markdown props like 'level' or 'node' are not used directly in the output element.
}

interface ParagraphProps extends ComponentPropsWithoutRef<'p'> {
  children?: ReactNode;
}

interface LinkProps extends ComponentPropsWithoutRef<'a'> {
  children?: ReactNode;
  // href is part of ComponentPropsWithoutRef<'a'>
}

interface ListProps extends ComponentPropsWithoutRef<'ul'> { // Applicable to ul and ol
  children?: ReactNode;
  // Specific react-markdown props like 'ordered', 'depth' are not used directly.
}

interface ListItemProps extends ComponentPropsWithoutRef<'li'> {
  children?: ReactNode;
  // Specific react-markdown props like 'checked', 'index' are not used directly.
}

interface BlockquoteProps extends ComponentPropsWithoutRef<'blockquote'> {
  children?: ReactNode;
}

// interface ImageProps extends ComponentPropsWithoutRef<'img'> {} // Removed as it's empty

interface TableProps extends ComponentPropsWithoutRef<'table'> {
  children?: ReactNode;
}

interface TableCellProps extends ComponentPropsWithoutRef<'td'> { // Applicable to th and td
  children?: ReactNode;
  // Specific react-markdown props like 'isHeader' are not used directly for styling here.
}

interface TableRowProps extends ComponentPropsWithoutRef<'tr'> {
  children?: ReactNode;
}


export function ReadableContent({
  content,
  previewLength = 400,
  proseClassName = "prose dark:prose-invert max-w-none text-muted-foreground text-md sm:text-lg leading-relaxed"
}: ReadableContentProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const needsTruncation = useMemo(() => content.length > previewLength, [content, previewLength]);

  const displayedContent = useMemo(() => {
    if (!needsTruncation || isExpanded) {
      return content;
    }
    let cutOffPoint = content.substring(0, previewLength).lastIndexOf('. ');
    if (cutOffPoint === -1 || cutOffPoint < previewLength / 2) {
        cutOffPoint = content.substring(0, previewLength).lastIndexOf('\n\n');
    }
    if (cutOffPoint === -1 || cutOffPoint < previewLength / 2) {
        cutOffPoint = previewLength;
    }
    return content.substring(0, cutOffPoint) + '...';
  }, [content, isExpanded, needsTruncation, previewLength]);

  if (!content) {
    return null;
  }

  const customComponents: Components = {
    h1: ({ children, ...rest }: HeadingProps) => <h1 className="text-4xl font-bold my-4" {...rest}>{children}</h1>,
    h2: ({ children, ...rest }: HeadingProps) => <h2 className="text-3xl font-semibold my-3" {...rest}>{children}</h2>,
    h3: ({ children, ...rest }: HeadingProps) => <h3 className="text-2xl font-semibold my-3" {...rest}>{children}</h3>,
    h4: ({ children, ...rest }: HeadingProps) => <h4 className="text-xl font-semibold my-2" {...rest}>{children}</h4>,
    h5: ({ children, ...rest }: HeadingProps) => <h5 className="text-lg font-semibold my-2" {...rest}>{children}</h5>,
    h6: ({ children, ...rest }: HeadingProps) => <h6 className="text-base font-semibold my-2" {...rest}>{children}</h6>,
    p: ({ children, ...rest }: ParagraphProps) => <p className="my-4 leading-relaxed" {...rest}>{children}</p>,
    a: ({ children, ...rest }: LinkProps) => (
      <a className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    ),
    ul: ({ children, ...rest }: ListProps) => <ul className="list-disc list-inside my-4 pl-4" {...rest}>{children}</ul>,
    ol: ({ children, ...rest }: ListProps) => <ol className="list-decimal list-inside my-4 pl-4" {...rest}>{children}</ol>,
    li: ({ children, ...rest }: ListItemProps) => <li className="my-1" {...rest}>{children}</li>,
    blockquote: ({ children, ...rest }: BlockquoteProps) => (
      <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4 text-gray-600" {...rest}>
        {children}
      </blockquote>
    ),
    img: ({ alt, ...rest }: ComponentPropsWithoutRef<'img'>) => ( // Use ComponentPropsWithoutRef directly, ensure alt is destructured
      // eslint-disable-next-line @next/next/no-img-element
      <img className="my-4 rounded-md shadow-md max-w-full h-auto" alt={alt || ''} {...rest} /> // Provide alt prop
    ),
    table: ({ children, ...rest }: TableProps) => (
      <table className="table-auto w-full my-4 border-collapse border border-gray-300" {...rest}>{children}</table>
    ),
    thead: ({ children, ...rest }: ComponentPropsWithoutRef<'thead'>) => <thead className="bg-gray-100" {...rest}>{children}</thead>,
    tbody: ({ children, ...rest }: ComponentPropsWithoutRef<'tbody'>) => <tbody {...rest}>{children}</tbody>,
    tr: ({ children, ...rest }: TableRowProps) => <tr className="border-b border-gray-300" {...rest}>{children}</tr>,
    th: ({ children, ...rest }: TableCellProps) => <th className="border border-gray-300 px-4 py-2 text-left font-semibold" {...rest}>{children}</th>,
    td: ({ children, ...rest }: TableCellProps) => <td className="border border-gray-300 px-4 py-2" {...rest}>{children}</td>,
  };

  return (
    <div>
      <div className={proseClassName}>
        {/* Removed redundant className from ReactMarkdown as proseClassName is applied to parent div */}
        <ReactMarkdown
          rehypePlugins={[rehypeRaw]}
          remarkPlugins={[remarkGfm]}
          components={customComponents}
        >
          {displayedContent}
        </ReactMarkdown>
      </div>

      {needsTruncation && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-4 inline-flex items-center font-medium text-primary hover:text-opacity-80 transition-colors focus:outline-none group"
        >
          {isExpanded ? siteStrings.home.homePageDescriptionReadLess : siteStrings.home.homePageDescriptionReadMore}
          {isExpanded ? 
            <ChevronUp size={20} className="ml-1 transition-transform duration-200 ease-in-out group-hover:-translate-y-0.5" /> : 
            <ChevronDown size={20} className="ml-1 transition-transform duration-200 ease-in-out group-hover:translate-y-0.5" />
          }
        </button>
      )}
    </div>
  );
} 