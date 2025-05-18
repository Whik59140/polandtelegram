import os
import argparse
import pathlib
import google.generativeai as genai # Changed import for configure
# from google import genai # New SDK - Replaced by the above
from google.genai import types as genai_types # For specific configurations if needed
import asyncio # For concurrency
import re
import time
from dotenv import load_dotenv
from datetime import date, timedelta, datetime
from typing import List, Optional, Tuple, Dict, Any # Added Dict, Any
import yaml # Added for YAML frontmatter generation

# --- Load .env file early ---
load_dotenv()

# --- Configuration ---
PROMPT_TEMPLATE_FILE = "ai_blog_prompt_template.txt"
TITLES_FILE = "blog_keywords_list.txt" # We're using this for titles
DEFAULT_OUTPUT_DIR = "content/blog"
# Ensure this model name is compatible with the new SDK and your API access.
# For client.aio.models.generate_content, model is usually like 'gemini-1.5-pro-latest' or 'models/gemini-1.5-pro-latest'
AI_MODEL_NAME = "models/gemini-2.5-pro-preview-05-06" # Verify this exact model name format for the API
MAX_CONCURRENT_REQUESTS = 10 # Control concurrency level

# --- Language and Site Configuration from Environment ---
TARGET_LANGUAGE = os.getenv("TARGET_LANGUAGE")
TARGET_SITE_URL = os.getenv("TARGET_SITE_URL")



# --- Helper Functions ---

def load_api_key():
    """Loads the Gemini API key from environment variables."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY or GOOGLE_API_KEY environment variable not set.")
    print("API key loaded. Will be used by genai.Client().")
    return api_key

# Global client for the new SDK
# Initialize it after loading the key, or let it pick up from env var.
# client = None 

def load_prompt_template() -> str:
    """Loads the master prompt template from the specified file."""
    try:
        with open(PROMPT_TEMPLATE_FILE, "r", encoding="utf-8") as f:
            template_content = f.read()
        return template_content.format(
            TARGET_LANGUAGE=TARGET_LANGUAGE,
            TARGET_SITE_URL=TARGET_SITE_URL
        )
    except FileNotFoundError:
        print(f"Error: Prompt template file '{PROMPT_TEMPLATE_FILE}' not found.")
        raise
    except Exception as e:
        print(f"Error reading prompt template file: {e}")
        raise

def load_article_titles() -> List[str]:
    """Loads article titles from the specified file, skipping comments and empty lines."""
    titles = []
    try:
        with open(TITLES_FILE, "r", encoding="utf-8") as f:
            for line in f:
                stripped_line = line.strip()
                if stripped_line and not stripped_line.startswith("#"):
                    titles.append(stripped_line)
        return titles
    except FileNotFoundError:
        print(f"Error: Titles file '{TITLES_FILE}' not found.")
        return [] # Return empty list if file not found, can be handled by main logic
    except Exception as e:
        print(f"Error reading titles file: {e}")
        return []

async def generate_article_with_gemini_async(article_title: str, prompt_template: str, model_instance) -> Optional[str]:
    """
    Generates blog article content using the Gemini API asynchronously via a model instance.
    `model_instance` is expected to be a `genai.GenerativeModel` instance.
    Returns the AI's response text or None if an error occurs.
    """
    full_prompt = prompt_template.replace("[USER: INSERT YOUR ARTICLE TITLE HERE]", article_title)

    print(f"\n--- Sending prompt for title (async): '{article_title}' ---")
    
    # genai_types.GenerationConfig is correct for the config object itself
    # However, the API call expects a dict or a different GenerationConfig type.
    # generation_config_obj = genai_types.GenerationConfig(
    #     temperature=0.7,
    #     # candidate_count=1, # Often useful
    #     # max_output_tokens=2048, # Or more as needed
    # )

    # Pass generation_config as a dictionary as per the TypeError message
    generation_config_dict = {
        "temperature": 0.7,
        # "candidate_count": 1, # Optional: if you need to specify this
        # "max_output_tokens": 2048 # Optional: if you need to specify this
    }
    
    # Safety settings structure is also generally correct
    safety_settings_list = [
        {"category": genai_types.HarmCategory.HARM_CATEGORY_HARASSMENT, "threshold": genai_types.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE},
        {"category": genai_types.HarmCategory.HARM_CATEGORY_HATE_SPEECH, "threshold": genai_types.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE},
        # Setting sexually explicit content to BLOCK_NONE as per user request
        {"category": genai_types.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, "threshold": genai_types.HarmBlockThreshold.BLOCK_NONE},
        {"category": genai_types.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, "threshold": genai_types.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE},
    ]

    try:
        # Use model_instance.generate_content_async
        response = await model_instance.generate_content_async(
            contents=full_prompt, # contents is usually a list of parts or a string
            generation_config=generation_config_dict, # Using dict here
            safety_settings=safety_settings_list,
            # stream=False # Default is False for async, True for generate_content
        )
        # Response processing might need adjustment based on exact model/SDK version
        # For non-streaming, response often directly has .text or .parts
        if hasattr(response, 'text') and response.text:
            return response.text
        elif response.parts:
            return "".join(part.text for part in response.parts if hasattr(part, 'text'))
        else:
            print(f"Warning: Received an empty or malformed response from Gemini for title '{article_title}'. Response: {response}")
            return None
    except Exception as e:
        print(f"Error generating content with Gemini for title '{article_title}' (async): {type(e).__name__} - {e}")
        return None

def _clean_extracted_value(value: Optional[str]) -> str:
    """Generic cleaner for frontmatter values extracted from AI.
    Removes leading/trailing backticks, single/double quotes, and whitespace.
    """
    if value is None:
        return ""
    cleaned = value.strip()
    # Remove leading/trailing backticks
    if cleaned.startswith("`") and cleaned.endswith("`"):
        cleaned = cleaned[1:-1].strip()
    # Remove leading/trailing double quotes
    if cleaned.startswith('"') and cleaned.endswith('"'):
        cleaned = cleaned[1:-1].strip()
    # Remove leading/trailing single quotes
    if cleaned.startswith("'") and cleaned.endswith("'"):
        cleaned = cleaned[1:-1].strip()
    return cleaned

def _slugify(text: str) -> str:
    """Generates a clean slug from a string."""
    if not text:
        return f"untitled-{int(time.time())}"
    slug = text.lower()
    slug = re.sub(r"([dl])'", r"\1-", slug) # d', l' special handling
    slug = re.sub(r"[’']", "", slug) # Remove other apostrophes
    slug = re.sub(r'[\s\W_]+', '-', slug, flags=re.UNICODE) # Replace whitespace, non-alphanum, underscore with hyphen
    slug = re.sub(r'[^a-z0-9\-]', '', slug, flags=re.UNICODE) # Keep only alphanumeric and hyphens
    slug = re.sub(r'--+', '-', slug) # Consolidate multiple hyphens
    slug = slug.strip('-')
    return slug or f"untitled-{int(time.time())}" # Ensure not empty

def parse_ai_response(ai_text_response: str, original_article_title: str) -> Tuple[Optional[str], Dict[str, Any]]:
    frontmatter_data: Dict[str, Any] = {}
    if not ai_text_response:
        print(f"parse_ai_response received empty input for title: {original_article_title}")
        return None, frontmatter_data

    instructional_headers_patterns = [
        re.compile(r"^\s*(?:Ecco gli elementi SEO e frontmatter:|Ora, ecco gli elementi SEO e frontmatter:|Di seguito, gli elementi per il frontmatter e SEO:|Guidance for SEO & Frontmatter Elements:).*?(\n\s*\n|\Z)", re.IGNORECASE | re.MULTILINE | re.DOTALL),
        re.compile(r"^\s*\*+\s*(?:Internal Link Suggestions|Recap Incorporati nel Testo|Suggerimenti Aggiuntivi|Alternatively, you could consider:)(?:[^:\n]*:\s*|\s*\n)[\s\S]*?(?=\n\s*\*+\s*[A-Za-z_`]+[^:\n]*:\s*|\n\s*\n|\Z)", re.IGNORECASE | re.MULTILINE | re.DOTALL),
        re.compile(r"^---\s*\n", re.MULTILINE),
    ]
    cleaned_response = ai_text_response
    for pattern in instructional_headers_patterns:
        cleaned_response = pattern.sub("", cleaned_response).strip()
    
    fields_to_extract = {
        "title": r"\*\*Final Recommended Title:\*\*\s*(.*?)(?=\n\*\*Suggested Slug:\*\*|\n\*\*|\Z)", # Stop before next known field or end
        "slug": r"\*\*Suggested Slug:\*\*\s*(.*?)\s*(?=\n\*\*|\Z)",
        "metaDescription": r"\*\*Meta Description / Excerpt:\*\*\s*(.*?)\s*(?=\n\*\*|\Z)",
        "tags": r"\*\*Suggested Tags:\*\*\s*(.*?)\s*(?=\n\*\*|\Z)",
        "imageAltText": r"\*\*Image Alt Text Suggestion:\*\*\s*(.*?)\s*(?=\n\*\*|\Z)",
        
        
    }
    
    article_body_text = cleaned_response
    extracted_text_segments_for_removal = []

    for key, pattern_str in fields_to_extract.items():
        match = re.search(pattern_str, article_body_text, re.MULTILINE | re.DOTALL | re.IGNORECASE)
        if match:
            value = _clean_extracted_value(match.group(1))

            if key == "title":
                # More aggressive cleaning for title to remove AI commentary
                common_phrases_to_remove = [
                    r"The provided title '(.*?)' is already very good",
                    r"The title '(.*?)' seems good and clear",
                    # Add more as observed
                ]
                for phrase_pattern in common_phrases_to_remove:
                    phrase_match = re.match(phrase_pattern, value, re.IGNORECASE)
                    if phrase_match:
                        value = phrase_match.group(1).strip() # Take the captured title part
                value = _clean_extracted_value(value) # Clean again after extraction
                if value:
                    frontmatter_data[key] = value
            elif key == "tags":
                if value:
                    tags_list = [_clean_extracted_value(tag) for tag in value.split(',') if tag.strip()]
                    frontmatter_data[key] = [tag for tag in tags_list if tag and tag.lower() not in ["e", "ed", "and"] and len(tag) > 1]
            elif key == "accordionData":
                val_lower = value.lower()
                if value == '""' or "(non sembra necessario" in val_lower or "(empty string" in val_lower or not value:
                    frontmatter_data[key] = "" 
                else:
                    frontmatter_data[key] = value 
            elif value: 
                frontmatter_data[key] = value
            
            if match.group(0) not in extracted_text_segments_for_removal: # Avoid duplicates
                 extracted_text_segments_for_removal.append(match.group(0))

    extracted_text_segments_for_removal.sort(key=len, reverse=True)
    for segment in extracted_text_segments_for_removal:
        article_body_text = article_body_text.replace(segment, "", 1).strip()

    article_markdown_content = article_body_text.strip()
    
    # Ensure title exists, fallback to original
    if not frontmatter_data.get("title"):
        frontmatter_data["title"] = _clean_extracted_value(original_article_title)
    
    # Always re-slugify, whether from AI or generated from title
    slug_source = frontmatter_data.get("slug", frontmatter_data.get("title", original_article_title))
    frontmatter_data["slug"] = _slugify(_clean_extracted_value(slug_source))
    if not frontmatter_data.get("slug"): # Should be handled by _slugify's fallback
        print(f"Warning: Slug is critically empty for {original_article_title}")

    if not frontmatter_data.get("metaDescription"):
        if article_markdown_content:
            excerpt = ' '.join(article_markdown_content.split()[:30]) 
            frontmatter_data["metaDescription"] = (_clean_extracted_value(excerpt)[:155] + '...') if len(excerpt) > 155 else _clean_extracted_value(excerpt)
        else:
            frontmatter_data["metaDescription"] = f"Discover more about {frontmatter_data.get('title', 'this interesting topic')}."

    # Remove any frontmatter blocks if AI accidentally included them in the body
    article_markdown_content = re.sub(r"^---\\s*\\n[\\s\\S]*?^---\\s*\\n", "", article_markdown_content, flags=re.MULTILINE).strip()

    # New: Clean trailing "Suggested Tags/Slugs" lines from the end of the article body
    trailing_suggestions_patterns = [
        re.compile(r"\\n\\s*(Suggested Tags:|Suggested Slugs:|Articoli Correlati Suggeriti:|Potenziali Link Interni:)[\\s\\S]*$", re.IGNORECASE),
        re.compile(r"\\n\\s*(?:Note:|Avvertenze:|Importante:)[\\s\\S]*$", re.IGNORECASE) # Also remove trailing notes
    ]
    for pattern in trailing_suggestions_patterns:
        article_markdown_content = pattern.sub("", article_markdown_content).strip()
    
    print(f"DEBUG: For '{original_article_title}', Extracted Frontmatter: {frontmatter_data}")
    if not article_markdown_content and not frontmatter_data.get("title"):
         print(f"Warning: Article content AND title are empty after parsing for: {original_article_title}")
        
    return article_markdown_content, frontmatter_data


def save_article(
    original_article_title: str, 
    article_body: Optional[str], 
    frontmatter_data: Dict[str, Any], 
    output_dir: str, 
    publish_date: date
):
    article_body_to_write = article_body.strip() if article_body is not None else ""
    if not article_body_to_write and not frontmatter_data.get("title"):
        print(f"Warning: Article body is effectively empty AND title is missing for '{original_article_title}'. Skipping save.")
        return

    # Slug should already be cleaned and finalized by parse_ai_response
    final_slug = frontmatter_data.get("slug")
    if not final_slug: # Absolute fallback, should ideally not be reached if parse_ai_response is robust
        final_slug = _slugify(original_article_title)
        print(f"Critical Warning: Slug was missing from frontmatter_data, used emergency fallback: {final_slug}")
        frontmatter_data["slug"] = final_slug

    yaml_ready_frontmatter = {}
    title_to_use = _clean_extracted_value(frontmatter_data.get("title", original_article_title))
    yaml_ready_frontmatter["title"] = title_to_use
    yaml_ready_frontmatter["slug"] = final_slug 

    simple_text_fields = ["metaDescription", "imageAltText", "authorId", "affiliateLinkId"]
    for key in simple_text_fields:
        if frontmatter_data.get(key):
            # Values should be pre-cleaned by parse_ai_response, but an extra _clean here won't hurt for safety
            yaml_ready_frontmatter[key] = _clean_extracted_value(frontmatter_data[key])
    
    accordion_val = frontmatter_data.get("accordionData") # Should be pre-processed by parse_ai_response
    if isinstance(accordion_val, str) and accordion_val.strip(): 
        yaml_ready_frontmatter["accordionData"] = accordion_val # Assume it's valid or empty string now

    tags = frontmatter_data.get("tags", []) # Should be a list of cleaned strings from parse_ai_response
    if isinstance(tags, list) and all(isinstance(tag, str) for tag in tags) and tags:
        yaml_ready_frontmatter["tags"] = tags
        
    yaml_ready_frontmatter["publishDate"] = publish_date.strftime('%Y-%m-%d')
    
    try:
        yaml_frontmatter_str = yaml.dump(
            yaml_ready_frontmatter, 
            sort_keys=False, 
            allow_unicode=True, 
            default_flow_style=False, 
            width=1000 
        )
    except Exception as e:
        print(f"Error serializing frontmatter to YAML for {final_slug}: {e}. Using fallback formatting.")
        yaml_items = []
        for k, v_item in yaml_ready_frontmatter.items():
            if isinstance(v_item, list):
                yaml_items.append(f"{k}:")
                for item_val in v_item:
                    escaped_item_val = str(item_val).replace('"', '\\"')
                    yaml_items.append(f'  - "{escaped_item_val}"') 
            else:
                value_str = str(v_item)
                condition1 = any(c in value_str for c in [':', '#', '{', '}', '[', ']', ',', '&', '*', '!', '|', '>', '\'', '\"', '%', '@', '`'])
                condition2 = value_str.lower() in ['true', 'false', 'yes', 'no', 'null']
                condition3 = re.match(r"^[0-9]+(\.[0-9]+)?$", value_str)
                if condition1 or condition2 or condition3:
                    if '"' in value_str and "'" in value_str:
                        # If both quote types are present, escape double quotes and wrap in double quotes
                        value_str = value_str.replace('"', '\\"')
                        value_str = f'"{value_str}"'
                    elif '"' in value_str:
                        # If only double quotes are present, wrap in single quotes
                        value_str = f"'{value_str}'"
                    else:
                        # Otherwise (only single quotes or no quotes that need special handling for this rule),
                        # wrap in double quotes. This also handles cases where value_str might contain
                        # characters that make it a non-simple scalar if unquoted.
                        value_str = f'"{value_str}"'
                yaml_items.append(f"{k}: {value_str}")
        yaml_frontmatter_str = "\n".join(yaml_items)

    # Aggressive cleaning for the final YAML block structure
    processed_yaml_block_intermediate = yaml_frontmatter_str.strip()
    lines = [line for line in processed_yaml_block_intermediate.split('\n') if line.strip() != ""]
    cleaned_yaml_payload = "\n".join(lines)
    print(f"DEBUG: Cleaned_yaml_payload (after aggressive cleaning for save):\n'''{cleaned_yaml_payload}'''")

    if cleaned_yaml_payload:
        file_content = f"""---
{cleaned_yaml_payload}
---

{article_body_to_write.strip()}
"""
    else:
        file_content = f"""---
---

{article_body_to_write.strip()}
"""
    
    print(f"DEBUG: Final file_content to be written for {final_slug}:")
    print("vvvvvvvvvvvvvvvvvvvv FILE CONTENT START vvvvvvvvvvvvvvvvvvvv")
    print(file_content)
    print("^^^^^^^^^^^^^^^^^^^^ FILE CONTENT END ^^^^^^^^^^^^^^^^^^^^")

    # Ensure output directory exists before saving file
    output_dir_path = pathlib.Path(output_dir)
    output_dir_path.mkdir(parents=True, exist_ok=True)
    # Use final_slug for the filename, ensuring it's clean
    file_path = output_dir_path / f"{final_slug}.md"

    try:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(file_content)
        print(f"Successfully saved article: {file_path}")
    except Exception as e:
        print(f"Error saving article {file_path}: {e}")


async def main():
    parser = argparse.ArgumentParser(description="Generate blog articles using Gemini API.")
    parser.add_argument(
        "--output_dir", 
        type=str, 
        default=DEFAULT_OUTPUT_DIR, 
        help=f"Directory to save generated articles (default: {DEFAULT_OUTPUT_DIR})"
    )
    parser.add_argument(
        "--start_date", 
        type=str, 
        default="16/05/2025", 
        help="Initial publish date for the first article (DD/MM/YYYY format)."
    )
    parser.add_argument(
        "--date_increment_days", 
        type=int, 
        default=2, 
        help="Number of days to increment publish date for each subsequent article."
    )
    parser.add_argument(
        "--max_articles",
        type=int,
        default=None,
        help="Maximum number of articles to generate (optional, processes all titles if not set)."
    )
    args = parser.parse_args()

    try:
        api_key = load_api_key()
        genai.configure(api_key=api_key)

        prompt_template = load_prompt_template()
        article_titles = load_article_titles()

        if not article_titles:
            print("No article titles loaded. Exiting.")
            return
        
        if args.max_articles is not None and args.max_articles > 0:
            article_titles = article_titles[:args.max_articles]
            print(f"Processing a maximum of {args.max_articles} articles.")

        gemini_model_instance = genai.GenerativeModel(AI_MODEL_NAME)
        print(f"Using Gemini model: {AI_MODEL_NAME}")

        current_publish_date = datetime.strptime(args.start_date, "%d/%m/%Y").date()
        
        semaphore = asyncio.Semaphore(MAX_CONCURRENT_REQUESTS)
        tasks = []

        async def generate_with_semaphore(title, template, model_inst, current_date): 
            async with semaphore:
                ai_response = await generate_article_with_gemini_async(title, template, model_inst)
                if ai_response:
                    article_body, frontmatter_dict = parse_ai_response(ai_response, title) 
                    
                    if (article_body and article_body.strip()) or frontmatter_dict.get("title"):
                        save_article(
                            original_article_title=title, 
                            article_body=article_body,
                            frontmatter_data=frontmatter_dict,
                            output_dir=args.output_dir,
                            publish_date=current_date
                        )
                    else:
                        print(f"Skipping save for title (empty content AND no title after parsing): '{title}'")
                else:
                    print(f"Skipping save for title (no AI response): '{title}'")
                
        for i, title in enumerate(article_titles):
            task_publish_date = current_publish_date + timedelta(days=i * args.date_increment_days)
            task = generate_with_semaphore(title, prompt_template, gemini_model_instance, task_publish_date)
            tasks.append(task)

        await asyncio.gather(*tasks)
        print("\nAll articles processed.")

    except ValueError as ve: 
        print(f"Configuration error: {ve}")
    except FileNotFoundError: 
        print("A required file was not found. Please check file paths and names.")
    except Exception as e:
        print(f"An unexpected error occurred in main: {type(e).__name__} - {e}")

if __name__ == "__main__":
    asyncio.run(main()) 