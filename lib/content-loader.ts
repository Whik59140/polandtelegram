import fs from 'fs/promises';
import path from 'path';
// import matter from 'gray-matter'; // Removed as it's not used and causes a lint error

// Determine content folder slug from environment variable, fallback to CONTENT_LANGUAGE, then a default (e.g., 'english' or 'spanish')
const CONTENT_FOLDER_SLUG = process.env.NEXT_PUBLIC_TARGET_FOLDER_SLUG || process.env.NEXT_PUBLIC_CONTENT_LANGUAGE || 'english';

export interface FaqItem {
  question: string;
  answer: string; // Answer might contain Markdown/HTML if parsed that way
}

export interface CategoryContent {
  title?: string; // The main H1 from the description, if we decide to extract it
  detailedDescription?: string; // This will be raw Markdown
  faqTitle?: string;
  faqs: FaqItem[]; // Questions and answers will be strings, potentially Markdown
}

// Define an identical interface for SubcategoryContent for now, for clarity and future-proofing
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SubcategoryContent extends CategoryContent {}

// const categoryContentDir = path.join(process.cwd(), 'content', 'de'); // OLD PATH

// Removed unused parseFaqs helper function that caused a regex lint error
// The main parsing logic is now self-contained within getCategoryContent

export async function getCategoryContent(categorySlug: string): Promise<CategoryContent | null> {
  // const fileName = `${categorySlug.replace('/', '_')}.md`; // OLD FILENAME LOGIC
  // const filePath = path.join(categoryContentDir, fileName); // OLD FILEPATH CONSTRUCTION

  const categorySpecificDir = path.join(process.cwd(), 'content', CONTENT_FOLDER_SLUG, categorySlug);
  const fileName = 'index.md';
  const filePath = path.join(categorySpecificDir, fileName);

  try {
    const fileContents = await fs.readFile(filePath, 'utf8');
    
    // Extract detailed description (as raw Markdown)
    const descriptionMatch = fileContents.match(/<start_description>([\s\S]*?)<end_description>/);
    let description = descriptionMatch && descriptionMatch[1] ? descriptionMatch[1].trim() : undefined;
    let extractedTitleFromDescription: string | undefined = undefined;

    if (description) {
      const lines = description.split('\n');
      if (lines[0] && lines[0].startsWith('# ')) {
        extractedTitleFromDescription = lines[0].substring(2).trim();
        description = lines.slice(1).join('\n').trim();
      }
    }

    // Extract FAQ title
    const faqTitleMatch = fileContents.match(/<start_faq_title>([\s\S]*?)<end_faq_title>/);
    const faqTitle = faqTitleMatch && faqTitleMatch[1] ? faqTitleMatch[1].trim() : undefined;

    // Extract FAQ section and parse Q&A pairs (answer as raw Markdown)
    const faqSectionMatch = fileContents.match(/<start_faq>([\s\S]*?)<end_faq>/);
    const faqs: FaqItem[] = [];
    if (faqSectionMatch && faqSectionMatch[1]) {
      const faqContent = faqSectionMatch[1].trim();
      const rawFaqs = faqContent.split(/\n\s*(?=\d+\.\s)/).filter(Boolean); 
      for (const rawFaq of rawFaqs) {
        const lines = rawFaq.trim().split('\n');
        const questionLine = lines.shift() || ''; 
        const questionMatch = questionLine.match(/\d+\.\s*\*\*(.*?)\*\*/);
        let question = questionMatch ? questionMatch[1].trim() : questionLine.replace(/^\d+\.\s*/, '').trim();
        if (question.endsWith('**')) { // Clean up trailing asterisks if regex didn't capture perfectly
            question = question.slice(0, -2).trim();
        } else if (question.startsWith('**')) { // Clean up leading asterisks if regex didn't capture perfectly
            question = question.slice(2).trim();
        }
        
        // The rest is the answer, kept as a raw Markdown string
        const answer = lines.map(l => l.trim()).filter(Boolean).join('\n'); 
        if (question && answer) {
          faqs.push({ question, answer });
        }
      }
    }
    
    return {
      title: extractedTitleFromDescription,
      detailedDescription: description,
      faqTitle,
      faqs,
    };

  } catch (error) {
    console.warn(`Warning: Could not read or parse category content for '${categorySlug}' (${fileName}). Page will use fallback content. Error:`, error);
    return null; 
  }
} 

export async function getSubcategoryContent(categorySlug: string, subcategorySlug: string): Promise<SubcategoryContent | null> {
  const subcategoryDir = path.join(process.cwd(), 'content', CONTENT_FOLDER_SLUG, categorySlug);
  const fileName = `${subcategorySlug}.md`;
  const filePath = path.join(subcategoryDir, fileName);
  console.log(`[getSubcategoryContent] Attempting to read: ${filePath}`);

  try {
    const fileContents = await fs.readFile(filePath, 'utf8');

    // Extract detailed description (as raw Markdown)
    const descriptionMatch = fileContents.match(/<start_description>([\s\S]*?)<end_description>/);
    const description = descriptionMatch && descriptionMatch[1] ? descriptionMatch[1].trim() : undefined;
    
    let extractedTitleFromDescription: string | undefined = undefined;
    if (description) {
      const lines = description.split('\n');
      if (lines[0] && lines[0].startsWith('# ')) {
        extractedTitleFromDescription = lines[0].substring(2).trim();
      }
    }

    // Extract FAQ title
    const faqTitleMatch = fileContents.match(/<start_faq_title>([\s\S]*?)<end_faq_title>/);
    const faqTitle = faqTitleMatch && faqTitleMatch[1] ? faqTitleMatch[1].trim() : undefined;

    // Extract FAQ section and parse Q&A pairs (answer as raw Markdown)
    const faqSectionMatch = fileContents.match(/<start_faq>([\s\S]*?)<end_faq>/);
    const faqs: FaqItem[] = [];
    if (faqSectionMatch && faqSectionMatch[1]) {
      const faqContent = faqSectionMatch[1].trim();
      const rawFaqs = faqContent.split(/\n\s*(?=\d+\.\s)/).filter(Boolean);
      for (const rawFaq of rawFaqs) {
        const lines = rawFaq.trim().split('\n');
        const questionLine = lines.shift() || ''; 
        const questionMatch = questionLine.match(/\d+\.\s*\*\*(.*?)\*\*/);
        let question = questionMatch ? questionMatch[1].trim() : questionLine.replace(/^\d+\.\s*/, '').trim();
        if (question.endsWith('**')) {
            question = question.slice(0, -2).trim();
        } else if (question.startsWith('**')) {
            question = question.slice(2).trim();
        }
        
        const answer = lines.map(l => l.trim()).filter(Boolean).join('\n'); 
        if (question && answer) {
          faqs.push({ question, answer });
        }
      }
    }
    
    const result: SubcategoryContent = {
      title: extractedTitleFromDescription,
      detailedDescription: description,
      faqTitle,
      faqs,
    };
    console.log(`[getSubcategoryContent] Final result for ${categorySlug}/${subcategorySlug}: title=${!!result.title}, desc=${!!result.detailedDescription}, faqTitle=${!!result.faqTitle}, faqs=${result.faqs.length}`);
    return result;

  } catch (error) {
    console.error(`[getSubcategoryContent] Error reading or parsing subcategory content for '${categorySlug}/${subcategorySlug}' (${fileName}). Returning null. Error:`, error);
    return null; 
  }
} 

// --- Homepage Content Loader ---
// homepageContentDir will now use CONTENT_FOLDER_SLUG defined at the top
// const homepageContentDir = path.join(process.cwd(), 'content', CONTENT_FOLDER_SLUG);
// No, this was defined inside the function, let's adjust getHomepageContent directly

export interface HomepageContent {
  title?: string; // The main H1 from the description
  detailedDescription?: string; // Raw Markdown for the main body
  faqTitle?: string;
  faqs: FaqItem[];
}

export async function getHomepageContent(): Promise<HomepageContent | null> {
  const fileName = "homepage.md";
  // Construct path using the dynamic CONTENT_FOLDER_SLUG
  const dynamicHomepageContentDir = path.join(process.cwd(), 'content', CONTENT_FOLDER_SLUG);
  const filePath = path.join(dynamicHomepageContentDir, fileName);
  console.log(`[getHomepageContent] Attempting to read: ${filePath}`); // LOGGING

  try {
    const fileContents = await fs.readFile(filePath, 'utf8');
    console.log("[getHomepageContent] File read successfully."); // LOGGING
    // console.log("[getHomepageContent] File content snapshot:\n", fileContents.substring(0, 300)); // Optional: Log a snapshot

    // Extract detailed description (as raw Markdown)
    const descriptionMatch = fileContents.match(/<start_description>([\s\S]*?)<end_description>/);
    let description = descriptionMatch && descriptionMatch[1] ? descriptionMatch[1].trim() : undefined;
    let extractedTitleFromDescription: string | undefined = undefined;
    // console.log("[getHomepageContent] descriptionMatch:", descriptionMatch ? !!descriptionMatch[1] : false); // LOGGING

    if (description) {
      // console.log("[getHomepageContent] Original description (first 100 chars):", description.substring(0,100)); // LOGGING
      const lines = description.split('\n');
      if (lines[0] && lines[0].startsWith('# ')) {
        extractedTitleFromDescription = lines[0].substring(2).trim();
        description = lines.slice(1).join('\n').trim();
        // console.log("[getHomepageContent] Extracted H1 title:", extractedTitleFromDescription);
        // console.log("[getHomepageContent] Description after H1 extraction (first 100 chars):", description.substring(0,100));
      }
    } else {
      console.log("[getHomepageContent] No description found with <start_description> tags.");
    }

    // Extract FAQ title
    const faqTitleMatch = fileContents.match(/<start_faq_title>([\s\S]*?)<end_faq_title>/);
    const faqTitle = faqTitleMatch && faqTitleMatch[1] ? faqTitleMatch[1].trim() : undefined;
    // console.log("[getHomepageContent] faqTitleMatch:", faqTitleMatch ? !!faqTitleMatch[1] : false, "Title:", faqTitle);

    // Extract FAQ section and parse Q&A pairs (answer as raw Markdown)
    const faqSectionMatch = fileContents.match(/<start_faq>([\s\S]*?)<end_faq>/);
    const faqs: FaqItem[] = [];
    // console.log("[getHomepageContent] faqSectionMatch:", faqSectionMatch ? !!faqSectionMatch[1] : false);

    if (faqSectionMatch && faqSectionMatch[1]) {
      const faqContent = faqSectionMatch[1].trim();
      // console.log("[getHomepageContent] Raw FAQ content (first 100 chars):", faqContent.substring(0,100));
      const rawFaqs = faqContent.split(/\n\s*(?=\d+\.\s)/).filter(Boolean);
      // console.log("[getHomepageContent] Number of raw FAQs found by split:", rawFaqs.length);
      for (const rawFaq of rawFaqs) {
        const lines = rawFaq.trim().split('\n');
        const questionLine = lines.shift() || '';
        const questionMatch = questionLine.match(/\d+\.\s*\*\*(.*?)\*\*/);
        let question = questionMatch ? questionMatch[1].trim() : questionLine.replace(/^\d+\.\s*/, '').trim();
        if (question.endsWith('**')) { 
            question = question.slice(0, -2).trim();
        } else if (question.startsWith('**')) { 
            question = question.slice(2).trim();
        }
        
        const answer = lines.map(l => l.trim()).filter(Boolean).join('\n');
        if (question && answer) {
          faqs.push({ question, answer });
        }
      }
      // console.log("[getHomepageContent] Parsed FAQs count:", faqs.length);
    } else {
      console.log("[getHomepageContent] No FAQ section found with <start_faq> tags.");
    }

    const result = {
      title: extractedTitleFromDescription,
      detailedDescription: description,
      faqTitle,
      faqs,
    };
    console.log("[getHomepageContent] Returning result:", {
        titleIsPresent: !!result.title,
        descriptionIsPresent: !!result.detailedDescription,
        faqTitleIsPresent: !!result.faqTitle,
        faqCount: result.faqs.length
    }); // LOGGING
    return result;

  } catch (error) {
    console.error(`[getHomepageContent] Error reading or parsing homepage content (${fileName}). Error:`, error); // LOGGING (changed to error)
    return null;
  }
} 