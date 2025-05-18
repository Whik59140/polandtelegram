import google.generativeai as genai
import os
from dotenv import load_dotenv
import concurrent.futures
import math
import time
import datetime # Crucial for date calculations

# Load .env file early
load_dotenv()

# --- Constants ---
TOTAL_TITLES_TO_GENERATE = 300 # Example: Generate 300 titles in total
TITLES_PER_BATCH = 20
MAX_CONCURRENT_WORKERS = 10 # Adjust based on your API rate limits and machine capability
DAYS_BETWEEN_ARTICLES = 2 # Publishing one article every 2 days

# --- Dynamic Date/Year Configuration ---
SCRIPT_RUN_DATE = datetime.date.today() # The date the script is actually run
YEAR_CURRENT_TARGET = str(SCRIPT_RUN_DATE.year) # e.g., if script run in 2025, this is "2025"
YEAR_NEXT_TARGET = str(SCRIPT_RUN_DATE.year + 1)    # e.g., if script run in 2025, this is "2026"
# The date when titles should start using YEAR_NEXT_TARGET
TRANSITION_TO_NEXT_YEAR_DATE = datetime.date(int(YEAR_NEXT_TARGET), 1, 1)

# --- Language Configuration from Environment ---
ENV_TARGET_LANGUAGE = os.getenv("TARGET_LANGUAGE")
# Used in the prompt for country-specific examples
NEXT_PUBLIC_COUNTRY_NAME = os.getenv("NEXT_PUBLIC_COUNTRY_NAME", "your country") # Default if not set

if not ENV_TARGET_LANGUAGE:
    print("Error: TARGET_LANGUAGE environment variable is not set.")
    exit(1)

LANGUAGE_NAME_FOR_PROMPT = ENV_TARGET_LANGUAGE.capitalize()

# BATCH_PROMPT_TEMPLATE - Uses {{year_for_prompt}}
BATCH_PROMPT_TEMPLATE = f"""
You are an expert SEO content strategist specializing in creating engaging article titles for a website that aggregates Telegram groups and channels for dating and adult connections.
Your task is to generate a list of {{num_titles_for_this_batch}} unique, SEO-optimized article titles for the current batch.
This is part of a larger request to generate {{total_titles_overall}} titles in total across multiple batches.
The titles should cover the following 6 strategic content categories, targeting niches like gay, trans, straight, MILF, and specific city/region-based dating within **{{country_name_for_prompt}}**.

Guidelines for ALL titles:
1.  **Language:** {{LANGUAGE_NAME_FOR_PROMPT}}
2.  **SEO Optimization:**
    *   Incorporate primary keywords naturally (e.g., "Telegram groups," "Telegram channels," "dating," "hookups," "sex," "meet," specific niches like "gay," "trans," "MILF").
    *   Emphasize long-tail keywords (3+ words).
    *   Use synonyms and variations of core concepts.
    *   Titles should reflect user search queries and problems.
3.  **Engaging & Click-Worthy:** Titles must be compelling and encourage clicks while accurately reflecting potential content. Include calls to action or highlight benefits (e.g., "Join Now," "{{year_for_prompt}} Guide," "Verified & Active," "Step-by-Step").
4.  **Format:** Provide the titles as a plain list, with each title on a new line. Do not number the titles.
5.  **Quantity:** Generate exactly {{num_titles_for_this_batch}} titles for this specific batch, aiming for a mix across the 6 categories described below.
6.  **Target Year:** Incorporate the year **{{year_for_prompt}}** where appropriate for freshness (e.g., "{{year_for_prompt}} Guide", "Best in {{year_for_prompt}}").

Strategic Content Categories to Cover:

✅ 1. City/Region-Based Dating Guides:
    *   Focus: Target local keywords + niche within **{{country_name_for_prompt}}**.
    *   Instructions: When you see "[City/Region]", replace it with diverse, actual city or region names from **{{country_name_for_prompt}}**.
    *   Examples: "Best Gay Dating Telegram Groups in [City/Region in {{country_name_for_prompt}}] [{{year_for_prompt}} Guide]", "Join Top Trans Dating Telegram Groups in [City/Region in {{country_name_for_prompt}}]", "How to Find Discreet Gay Hookups on Telegram in [A Major City in {{country_name_for_prompt}}]"
    *   Tip: Use placeholders like "[City/Region]" for the AI to understand it should vary locations within **{{country_name_for_prompt}}**. Include keywords like "join now," "free groups," "safe & discreet."

✅ 2. "How-To" Guides on Using Telegram for Dating:
    *   Focus: Educational, keyword-rich.
    *   Examples: "How to Use Telegram to Meet [Niche] Singles Near You in {{year_for_prompt}}", "Find [Niche] Dating Groups on Telegram – Step-by-Step {{year_for_prompt}}", "Why Telegram Is the Best App for [Niche] Sex Dating in {{year_for_prompt}}"
    *   Tip: Optimize for "Telegram + dating + [Niche]" search terms.

✅ 3. Curated Group Lists (Lead Magnets):
    *   Focus: Your main lead magnet content.
    *   Examples: "Top 10 [Niche] Dating Telegram Groups You Should Join ({{year_for_prompt}} Update)", "Best [Niche] Dating Telegram Channels – Verified & Active {{year_for_prompt}}", "NSFW Telegram Groups for [Niche] Men – Real and Active in {{year_for_prompt}}"
    *   Tip: Imply ease of joining and verified/active status.

✅ 4. Reviews and Comparisons:
    *   Focus: Help people choose Telegram over other dating apps for specific niches.
    *   Examples: "Telegram vs [Competitor App like Grindr/Tinder]: Which Is Better for [Niche] Hookups in {{year_for_prompt}}?", "Best Apps for [Niche] Dating in {{year_for_prompt}} – Why Telegram Stands Out", "Telegram [Niche] Dating: Real Reviews from Group Members ({{year_for_prompt}})"
    *   Tip: Leverage comparison SEO keywords.

✅ 5. "NSFW" / Sexual Curiosity Content (Use Subtle SEO):
    *   Focus: Traffic-driven, requires careful phrasing.
    *   Examples: "Hidden Telegram Channels for Adult [Niche] Dating You Shouldn't Miss ({{year_for_prompt}})", "NSFW Telegram Groups for [Niche] That Actually Work – No Bots ({{year_for_prompt}} Edition)", "Secret [Niche] Hookup Groups on Telegram – {{year_for_prompt}} Update"
    *   Tip: Use censored or clever phrasing for sensitive terms if needed, but aim for discoverability.

✅ 6. Lifestyle & Identity Topics for Niches:
    *   Focus: Attract niches organically with relatable content, potentially localized to **{{country_name_for_prompt}}**.
    *   Examples: "What It's Like Dating as a [Niche] Man/Woman/Person in [City/Region in {{country_name_for_prompt}}] ({{year_for_prompt}} Perspective)", "[Niche] Dating Challenges in {{year_for_prompt}} in **{{country_name_for_prompt}}** – And How Telegram Can Help", "The Rise of Private [Niche] Dating Groups on Telegram (Focus on **{{country_name_for_prompt}}** Trends {{year_for_prompt}})"
    *   Tip: Connect relatable stories to the solution (Telegram groups).

Please generate {{num_titles_for_this_batch}} titles following ALL these guidelines for this batch, ensuring a good distribution across the 6 categories and various niches (gay, trans, MILF, straight, city-specific for **{{country_name_for_prompt}}** etc.). Remember to use the year **{{year_for_prompt}}** as determined for this batch.
"""

# --- Helper Functions ---
def load_api_key():
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY or GOOGLE_API_KEY environment variable not set.")
        exit(1)
    return api_key

def _clean_generated_titles(titles_text_list, num_expected):
    titles_list = [title.strip() for title in titles_text_list if title.strip()]
    cleaned_titles = []
    for title in titles_list:
        stripped_title = title.lstrip()
        if any(stripped_title.startswith(marker) for marker in [f"{i}." for i in range(1, num_expected + 10)] +
                                                               [f"{i})" for i in range(1, num_expected + 10)] +
                                                               ["- ", "* ", " - "]): # Common list markers
            parts = stripped_title.split(" ", 1)
            cleaned_titles.append(parts[-1].strip() if len(parts) > 1 else parts[0].strip())
        else:
            cleaned_titles.append(title.strip())
    return cleaned_titles


def _generate_title_batch(model, num_titles_for_batch, batch_index, total_titles_overall, prompt_template, global_starting_index_for_batch):
    days_offset = global_starting_index_for_batch * DAYS_BETWEEN_ARTICLES
    projected_publish_date_of_first_title_in_batch = SCRIPT_RUN_DATE + datetime.timedelta(days=days_offset)

    if projected_publish_date_of_first_title_in_batch < TRANSITION_TO_NEXT_YEAR_DATE:
        year_to_use_in_prompt = YEAR_CURRENT_TARGET
    else:
        year_to_use_in_prompt = YEAR_NEXT_TARGET
        
    print(f"Starting batch {batch_index + 1} (Global index from: {global_starting_index_for_batch+1}): "
          f"Requesting {num_titles_for_batch} titles for language: {LANGUAGE_NAME_FOR_PROMPT}. "
          f"Projected publish date for 1st title in batch: {projected_publish_date_of_first_title_in_batch}. Using Year: {year_to_use_in_prompt}.")
    
    prompt = prompt_template.format(
        num_titles_for_this_batch=num_titles_for_batch,
        total_titles_overall=total_titles_overall,
        LANGUAGE_NAME_FOR_PROMPT=LANGUAGE_NAME_FOR_PROMPT,
        country_name_for_prompt=NEXT_PUBLIC_COUNTRY_NAME,
        year_for_prompt=year_to_use_in_prompt
    )
    try:
        response = model.generate_content(prompt) 
        
        if response.candidates and response.candidates[0].content.parts:
            raw_text = response.candidates[0].content.parts[0].text
            titles_in_batch = _clean_generated_titles(raw_text.split('\n'), num_titles_for_batch)
            print(f"Batch {batch_index + 1} finished: Received {len(titles_in_batch)} titles (Used Year: {year_to_use_in_prompt}).")
            # Return a list of (year, title) tuples
            return [(year_to_use_in_prompt, title) for title in titles_in_batch]
        else:
            print(f"Error in batch {batch_index + 1}: No content received from Gemini API (Used Year: {year_to_use_in_prompt}).")
            if hasattr(response, 'prompt_feedback') and response.prompt_feedback:
                print(f"Prompt Feedback for batch {batch_index + 1}: {response.prompt_feedback}")
            else:
                print(f"No detailed prompt feedback available for batch {batch_index + 1}.")
            return []
    except Exception as e:
        print(f"An error occurred in batch {batch_index + 1} (Used Year: {year_to_use_in_prompt}) while calling Gemini API: {e}")
        return []

def generate_article_titles():
    try:
        api_key = load_api_key()
        genai.configure(api_key=api_key)
    except Exception as e:
        print(f"Failed to configure Gemini API: {e}")
        return []

    model = genai.GenerativeModel('gemini-1.5-pro-latest') # Or your preferred model

    all_generated_titles = []
    num_batches = math.ceil(TOTAL_TITLES_TO_GENERATE / TITLES_PER_BATCH)
    
    print(f"--- Script Run Date: {SCRIPT_RUN_DATE} ---")
    print(f"--- Year for current titles (YEAR_CURRENT_TARGET): {YEAR_CURRENT_TARGET} ---")
    print(f"--- Year for future titles (YEAR_NEXT_TARGET): {YEAR_NEXT_TARGET} ---")
    print(f"--- Transition to {YEAR_NEXT_TARGET} will occur for titles whose projected publish date is on or after: {TRANSITION_TO_NEXT_YEAR_DATE} ---")
    print(f"Preparing to generate {TOTAL_TITLES_TO_GENERATE} titles in {num_batches} batches for language '{LANGUAGE_NAME_FOR_PROMPT}' in '{NEXT_PUBLIC_COUNTRY_NAME}'.")

    current_title_global_index = 0 

    with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_CONCURRENT_WORKERS) as executor:
        futures = []
        
        for i in range(num_batches):
            titles_for_this_batch = min(TITLES_PER_BATCH, TOTAL_TITLES_TO_GENERATE - current_title_global_index)
            if titles_for_this_batch <= 0:
                break
            
            futures.append(executor.submit(
                _generate_title_batch, 
                model, 
                titles_for_this_batch, 
                i, 
                TOTAL_TITLES_TO_GENERATE, 
                BATCH_PROMPT_TEMPLATE,
                current_title_global_index 
            ))
            current_title_global_index += titles_for_this_batch 

        for future in concurrent.futures.as_completed(futures):
            try:
                batch_titles_with_year = future.result() # Now a list of (year, title)
                all_generated_titles.extend(batch_titles_with_year)
                # Correctly count collected titles, not just the length of the list of tuples
                print(f"Collected {len([t for _, t in batch_titles_with_year])} titles from a batch. Total (year, title) pairs collected so far: {len(all_generated_titles)}")
            except Exception as exc:
                print(f"A batch generated an exception: {exc}")

    # Sort by year first (ascending). Python's sort is stable.
    all_generated_titles.sort(key=lambda item: item[0]) 
    
    # Deduplicate based on title, keeping the (year, title) structure
    # and the year from the first encountered instance of a title.
    final_list_of_tuples = []
    seen_titles = set()
    for year_val, title_val in all_generated_titles:
        if title_val not in seen_titles:
            final_list_of_tuples.append((year_val, title_val))
            seen_titles.add(title_val)
            # Optimization: stop if we have enough titles
            if len(final_list_of_tuples) == TOTAL_TITLES_TO_GENERATE:
                break
    
    print(f"Total unique titles (with year) after de-duplication and sorting: {len(final_list_of_tuples)}")
    return final_list_of_tuples

if __name__ == "__main__":
    start_time = time.time()
    print("Starting article title generation process...")
    
    generated_titles_tuples = generate_article_titles() # This will be a list of (year, title) tuples
    
    lang_output_folder_name = os.getenv("NEXT_PUBLIC_TARGET_FOLDER_SLUG", ENV_TARGET_LANGUAGE.lower())
    output_dir = os.path.join("output", lang_output_folder_name)
    os.makedirs(output_dir, exist_ok=True)
    
    # Output filename is now fixed
    output_filename = "blog_keywords_list.txt"
    full_output_path = os.path.join(output_dir, output_filename)

    if generated_titles_tuples:
        with open(full_output_path, "w", encoding="utf-8") as f:
            for year, title in generated_titles_tuples: # Iterate over list of tuples
                f.write(f"{year} - {title}\n") # Write year and title
        print(f"{len(generated_titles_tuples)} article titles generated and saved to {full_output_path}")
        if len(generated_titles_tuples) < TOTAL_TITLES_TO_GENERATE:
            print(f"Warning: Successfully generated {len(generated_titles_tuples)} titles, which is less than the requested {TOTAL_TITLES_TO_GENERATE}.")
    else:
        print("No titles were generated. Please check the script, API configuration, and any error messages.")
        with open(full_output_path, "w", encoding="utf-8") as f: 
            f.write("Failed to generate titles. Please check generate_titles.py and your Gemini API setup.\n")
        print(f"A placeholder message has been written to {full_output_path}.")
    
    end_time = time.time()
    print(f"Title generation process completed in {end_time - start_time:.2f} seconds.")