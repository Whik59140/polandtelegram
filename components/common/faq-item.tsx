'use client'; // Keep if it uses client-side interactivity like <details>

import React from 'react';

interface FaqItemProps {
  question: string;
  answer: string; // Keep as string, we will process it before passing to dangerouslySetInnerHTML
}

export function FaqItem({ question, answer }: FaqItemProps) {
  // Process the answer string to convert Markdown links to HTML anchors
  const processedAnswer = answer
    .replace(/\n/g, '<br />')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-primary hover:underline">$1</a>');

  return (
    <details className="group bg-card text-card-foreground rounded-lg shadow-md mb-3 transition-shadow hover:shadow-lg">
      <summary className="font-semibold text-md sm:text-lg text-primary cursor-pointer list-none flex justify-between items-center p-4 group-open:border-b group-open:border-border">
        {question}
        <svg className="w-5 h-5 text-primary transform transition-transform duration-200 group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
      </summary>
      <div 
        className="p-4 text-muted-foreground text-sm sm:text-base prose dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: processedAnswer }}
      />
    </details>
  );
} 