import google.generativeai as genai
import os
import json
from typing import Dict, List, Any # For type hinting
from dotenv import load_dotenv # <-- Added import
import random # Add random for shuffling/sampling
import asyncio # Added for concurrency
import time # Import time for main_async

# Load environment variables from .env file FIRST
load_dotenv()

# --- Target Language Configuration ---
TARGET_LANGUAGE = os.getenv("TARGET_LANGUAGE")
if not TARGET_LANGUAGE:
    print("Error: TARGET_LANGUAGE environment variable is not set. This variable is required.")
    print("Please set it in your .env file or your system environment.")
    print("Example: TARGET_LANGUAGE=spanish")
    exit(1) # Exit the script if the variable is not set

# Import data from data_config.py
from data_config import (
    LANG_CONFIGS,
    PARENT_CATEGORIES_EN, # English keys for categories
    # SUBCATEGORIES_EN, # English keys for subcategories - keep for reference if needed
    SUBCATEGORIES_BY_PARENT_KEY # Mapping of parent EN key to list of subcategory EN keys
)

# Load the configuration for the TARGET_LANGUAGE
if TARGET_LANGUAGE not in LANG_CONFIGS:
    raise ValueError(f"Configuration for TARGET_LANGUAGE '{TARGET_LANGUAGE}' not found in data_config.LANG_CONFIGS.")
current_lang_config = LANG_CONFIGS[TARGET_LANGUAGE]

# Site-specific details for prompts, now from the loaded language config
# These keys in current_lang_config should be like "SITE_NAME_PROMPT", "SITE_DESCRIPTION_PROMPT"
SITE_NAME_FOR_PROMPT = current_lang_config.get("SITE_NAME_PROMPT", f"Default Site Name {TARGET_LANGUAGE.upper()}")
SITE_DESCRIPTION_SHORT_FOR_PROMPT = current_lang_config.get("SITE_DESCRIPTION_PROMPT", "Default site description.")
LANGUAGE_NAME_FOR_PROMPT = current_lang_config.get("LANGUAGE_NAME_FOR_PROMPT", TARGET_LANGUAGE.upper())

# Prompt file names, now from the loaded language config
# Ensure LANG_CONFIGS structure is: LANG_CONFIGS[lang_code]["PROMPT_FILES"]["subcategory"]
PROMPT_FILE_SUBCATEGORY = current_lang_config.get("PROMPT_FILES", {}).get("subcategory", "gemini_subcategory_prompt.txt")
PROMPT_FILE_CATEGORY = current_lang_config.get("PROMPT_FILES", {}).get("category", "gemini_category_prompt.txt")
PROMPT_FILE_HOMEPAGE = current_lang_config.get("PROMPT_FILES", {}).get("homepage", "gemini_homepage_prompt.txt")

# --- Load Gemini System Prompts from files (using dynamic filenames) ---
GEMINI_SYSTEM_PROMPT_SUBCATEGORY = ""
GEMINI_SYSTEM_PROMPT_CATEGORY = ""
GEMINI_SYSTEM_PROMPT_HOMEPAGE = ""

try:
    with open(PROMPT_FILE_SUBCATEGORY, "r", encoding="utf-8") as f:
        GEMINI_SYSTEM_PROMPT_SUBCATEGORY = f.read()
    if not GEMINI_SYSTEM_PROMPT_SUBCATEGORY:
        print(f"Warning: {PROMPT_FILE_SUBCATEGORY} is empty. Subcategory generation will likely fail or produce poor results.")
    else:
        print(f"Gemini subcategory system prompt loaded successfully from {PROMPT_FILE_SUBCATEGORY}")
except FileNotFoundError:
    print(f"Warning: {PROMPT_FILE_SUBCATEGORY} not found. Subcategory generation will be skipped.")
except Exception as e:
    print(f"Error loading subcategory prompt template ({PROMPT_FILE_SUBCATEGORY}): {e}")

try:
    with open(PROMPT_FILE_CATEGORY, "r", encoding="utf-8") as f:
        GEMINI_SYSTEM_PROMPT_CATEGORY = f.read()
    if not GEMINI_SYSTEM_PROMPT_CATEGORY:
        print(f"Warning: {PROMPT_FILE_CATEGORY} is empty. Parent category generation will likely fail or produce poor results.")
    else:
        print(f"Gemini category system prompt loaded successfully from {PROMPT_FILE_CATEGORY}")
except FileNotFoundError:
    print(f"Warning: {PROMPT_FILE_CATEGORY} not found. Parent category generation will be skipped.")
except Exception as e:
    print(f"Error loading category prompt template ({PROMPT_FILE_CATEGORY}): {e}")

try:
    with open(PROMPT_FILE_HOMEPAGE, "r", encoding="utf-8") as f:
        GEMINI_SYSTEM_PROMPT_HOMEPAGE = f.read()
    if not GEMINI_SYSTEM_PROMPT_HOMEPAGE:
        print(f"Warning: {PROMPT_FILE_HOMEPAGE} is empty. Homepage content generation will likely fail or produce poor results.")
    else:
        print(f"Gemini homepage system prompt loaded successfully from {PROMPT_FILE_HOMEPAGE}")
except FileNotFoundError:
    print(f"Warning: {PROMPT_FILE_HOMEPAGE} not found. Homepage content generation will be skipped.")
except Exception as e:
    print(f"Error loading homepage prompt template ({PROMPT_FILE_HOMEPAGE}): {e}")


# --- Gemini API Configuration ---
try:
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    if not GEMINI_API_KEY:
        raise KeyError("GEMINI_API_KEY not found in .env or environment variables.")
    genai.configure(api_key=GEMINI_API_KEY)
    print("Gemini API Key loaded and configured successfully.")
except KeyError as e:
    print(f"Error: {e}")
    exit(1)

generation_config = genai.GenerationConfig(
    temperature=0.75,
    top_p=0.95,
    top_k=64,
    max_output_tokens=8192,
    response_mime_type="text/plain",
)
safety_settings = [
    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
]

model_subcategory: genai.GenerativeModel | None = None
model_category: genai.GenerativeModel | None = None
model_homepage: genai.GenerativeModel | None = None

async def generate_gemini_content_async(
    input_json_str: str,
    semaphore: asyncio.Semaphore,
    model_to_use: genai.GenerativeModel
) -> str:
    async with semaphore:
        log_name = "Unknown Item (pre-JSON parse)"
        try:
            input_data_for_log = json.loads(input_json_str)
            # Use standardized keys for logging if available, falling back progressively
            log_name = input_data_for_log.get('subcategory_name_localized',
                         input_data_for_log.get('parent_category_name_localized',
                                              input_data_for_log.get('site_name', 'Unknown Item')))
        except json.JSONDecodeError:
            log_name = "Unknown Item (JSON error in input)"

        print(f"  Worker acquired semaphore, generating for: {log_name} using model: {model_to_use.model_name if model_to_use else 'No Model'}")

        if not model_to_use:
             print(f"Error: Model not provided for {log_name}. Skipping API call.")
             return f"Error: Model not provided for {log_name}."

        try:
            response = await model_to_use.generate_content_async(
                [
                {"role": "user", "parts": [
                        "Okay, generate the content based on the following data:\n" +
                        input_json_str
                    ]}
                ]
            )

            if not response.candidates:
                print("Error: No candidates in response from Gemini API.")
                if hasattr(response, 'prompt_feedback') and response.prompt_feedback:
                    print(f"  Prompt Feedback: {response.prompt_feedback}")
                return "Error: Gemini API returned no candidates. Check prompt feedback in logs."

            candidate = response.candidates[0]

            if not candidate.content or not candidate.content.parts:
                print(f"Error: No content parts in response candidate. Candidate details:")
                print(f"  Finish Reason: {candidate.finish_reason}")
                if hasattr(candidate, 'finish_message') and candidate.finish_message:
                    print(f"  Finish Message: {candidate.finish_message}")
                else:
                    print("  Finish Message: Not available")
                if hasattr(candidate, 'safety_ratings') and candidate.safety_ratings:
                    print(f"  Safety Ratings: {candidate.safety_ratings}")
                else:
                    print("  Safety Ratings: Not available")
                return f"Error: Gemini API returned no content. Finish Reason: {candidate.finish_reason}. Check logs for details."

            return candidate.content.parts[0].text
        except Exception as e:
            print(f"An unexpected error occurred during API call or processing response for {log_name}: {e}")
            # print(f"Input JSON that may have caused error for {log_name}: {input_json_str}") # Be cautious with logging full input if it's very large
            return f"Error generating content for {log_name} due to an exception: {e}"

CONCURRENT_REQUESTS_LIMIT = 10

async def process_subcategory_concurrently(
    params: dict,
    semaphore: asyncio.Semaphore,
    output_dir: str
) -> dict:
    subcategory_input_json_str = params["subcategory_input_json_str"]
    prospective_filename = params["prospective_filename"]
    prospective_filepath = os.path.join(output_dir, prospective_filename)

    log_entry = {
        "type": "subcategory",
        "parent_category_key_en": params["parent_key_en"],
        "parent_category_name_localized": params["parent_name_localized"],
        "subcategory_key_en": params["subcat_key_en"],
        "subcategory_name_localized": params["subcat_name_localized"],
        "filename": prospective_filename,
        "content_status": "ERROR"
    }

    if os.path.exists(prospective_filepath):
        print(f"    Subcategory content {prospective_filepath} already exists. Skipping generation.")
        log_entry["content_status"] = "SKIPPED_EXISTING"
        return log_entry

    markdown_content = await generate_gemini_content_async(
        subcategory_input_json_str,
        semaphore,
        model_subcategory
    )
    if markdown_content.startswith("Error:"):
        print(f"    Failed to generate content for {params['subcat_name_localized']}: {markdown_content}")
        log_entry["content_status"] = markdown_content
    else:
        try:
            # Ensure the directory for the file exists just before writing
            # os.path.dirname(prospective_filepath) is equivalent to output_dir here
            os.makedirs(output_dir, exist_ok=True)
            with open(prospective_filepath, "w", encoding="utf-8") as f:
                f.write(markdown_content)
            print(f"    Successfully saved: {prospective_filepath}")
            log_entry["content_status"] = "OK"
        except IOError as e:
            print(f"    Failed to write file {prospective_filepath}: {e}")
            log_entry["content_status"] = f"Error writing file: {e}"
    return log_entry

async def process_parent_category_concurrently(
    params: dict,
    semaphore: asyncio.Semaphore,
    output_dir: str
) -> dict:
    parent_input_json_str = params["parent_input_json_str"]
    prospective_filename = params["prospective_filename"]
    prospective_filepath = os.path.join(output_dir, prospective_filename)

    log_entry = {
        "type": "parent_category",
        "parent_category_key_en": params["parent_key_en"],
        "parent_category_name_localized": params["parent_name_localized"],
        "filename": prospective_filename,
        "content_status": "ERROR"
    }

    if os.path.exists(prospective_filepath):
        print(f"    Parent category content {prospective_filepath} already exists. Skipping generation.")
        log_entry["content_status"] = "SKIPPED_EXISTING"
        return log_entry

    markdown_content = await generate_gemini_content_async(
        parent_input_json_str,
        semaphore,
        model_category
    )
    if markdown_content.startswith("Error:"):
        print(f"    Failed to generate content for PARENT {params['parent_name_localized']}: {markdown_content}")
        log_entry["content_status"] = markdown_content
    else:
        try:
            # Ensure the directory for the file exists just before writing
            # os.path.dirname(prospective_filepath) is equivalent to output_dir here
            os.makedirs(output_dir, exist_ok=True)
            with open(prospective_filepath, "w", encoding="utf-8") as f:
                f.write(markdown_content)
            print(f"    Successfully saved PARENT: {prospective_filepath}")
            log_entry["content_status"] = "OK"
        except IOError as e:
            print(f"    Failed to write file {prospective_filepath} for PARENT {params['parent_name_localized']}: {e}")
            log_entry["content_status"] = f"Error writing file: {e}"
    return log_entry

async def process_homepage_content_async(
    semaphore: asyncio.Semaphore,
    output_dir: str
) -> dict:
    homepage_filename = "homepage.md"
    homepage_filepath = os.path.join(output_dir, homepage_filename)

    log_entry = {
        "type": "homepage",
        "site_name": SITE_NAME_FOR_PROMPT,
        "filename": homepage_filename,
        "content_status": "ERROR"
    }

    if os.path.exists(homepage_filepath):
        print(f"  Homepage content {homepage_filepath} already exists. Skipping generation.")
        log_entry["content_status"] = "SKIPPED_EXISTING"
        return log_entry

    if not GEMINI_SYSTEM_PROMPT_HOMEPAGE or not model_homepage:
        error_msg = "Homepage system prompt or model not loaded. Skipping generation."
        print(f"  Error: {error_msg}")
        log_entry["content_status"] = error_msg
        return log_entry

    main_categories_for_prompt = []
    for pc_key_en in PARENT_CATEGORIES_EN:
        localized_name = current_lang_config["parent_category_names"].get(pc_key_en, pc_key_en)
        localized_slug = current_lang_config["parent_category_slugs"].get(pc_key_en, pc_key_en.lower())
        main_categories_for_prompt.append({
            "name_localized": localized_name,
            "slug_localized": localized_slug
        })

    all_subcategories_for_prompt = []
    for parent_key_en, sub_keys_en_list in SUBCATEGORIES_BY_PARENT_KEY.items():
        parent_slug_localized = current_lang_config["parent_category_slugs"].get(parent_key_en)
        if not parent_slug_localized:
            print(f"Warning: Missing localized slug for parent category EN key '{parent_key_en}' (lang: {TARGET_LANGUAGE}) when preparing homepage prompt. Subcategories under it might have incorrect paths.")
            continue

        for sub_key_en in sub_keys_en_list:
            sub_name_localized = current_lang_config["subcategory_names"].get(sub_key_en)
            sub_slug_localized = current_lang_config["subcategory_slugs"].get(sub_key_en)

            if not sub_name_localized or not sub_slug_localized:
                print(f"Warning: Missing localized name or slug for subcategory EN key '{sub_key_en}' (parent: {parent_key_en}, lang: {TARGET_LANGUAGE}). Skipping for homepage prompt.")
                continue

            all_subcategories_for_prompt.append({
                "name_localized": sub_name_localized,
                "parent_category_slug_localized": parent_slug_localized,
                "slug_localized": sub_slug_localized,
                "full_path_localized": f"/{parent_slug_localized}/{sub_slug_localized}"
            })

    homepage_input_data = {
        "site_name": SITE_NAME_FOR_PROMPT,
        "site_description_short": SITE_DESCRIPTION_SHORT_FOR_PROMPT,
        "target_language_name": LANGUAGE_NAME_FOR_PROMPT,
        "main_categories": main_categories_for_prompt, # Uses 'name_localized', 'slug_localized'
        "all_subcategories": all_subcategories_for_prompt # Uses 'name_localized', 'parent_category_slug_localized', etc.
    }
    homepage_input_json_str = json.dumps(homepage_input_data, ensure_ascii=False, indent=2)

    print(f"  Generating homepage content for {SITE_NAME_FOR_PROMPT}...")

    markdown_content = await generate_gemini_content_async(
        homepage_input_json_str,
        semaphore,
        model_homepage
    )

    if markdown_content.startswith("Error:"):
        print(f"    Failed to generate content for HOMEPAGE {SITE_NAME_FOR_PROMPT}: {markdown_content}")
        log_entry["content_status"] = markdown_content
    else:
        try:
            os.makedirs(output_dir, exist_ok=True)
            with open(homepage_filepath, "w", encoding="utf-8") as f:
                f.write(markdown_content)
            print(f"    Successfully saved HOMEPAGE content to: {homepage_filepath}")
            log_entry["content_status"] = "OK"
        except IOError as e:
            print(f"    Failed to write file {homepage_filepath} for HOMEPAGE: {e}")
            log_entry["content_status"] = f"Error writing file: {e}"
    return log_entry

async def main_async():
    start_time = time.time()
    processing_summary = []

    global model_subcategory, model_category, model_homepage
    if GEMINI_SYSTEM_PROMPT_SUBCATEGORY:
        model_subcategory = genai.GenerativeModel(
            model_name="gemini-2.5-pro-preview-05-06",
            safety_settings=safety_settings,
            generation_config=generation_config,
            system_instruction=GEMINI_SYSTEM_PROMPT_SUBCATEGORY
        )
        print("Subcategory generation model initialized.")
    else:
        print("Subcategory system prompt not loaded. Subcategory model NOT initialized.")

    if GEMINI_SYSTEM_PROMPT_CATEGORY:
        model_category = genai.GenerativeModel(
            model_name="gemini-2.5-pro-preview-05-06",
            safety_settings=safety_settings,
            generation_config=generation_config,
            system_instruction=GEMINI_SYSTEM_PROMPT_CATEGORY
        )
        print("Category generation model initialized.")
    else:
        print("Category system prompt not loaded. Category model NOT initialized.")

    if GEMINI_SYSTEM_PROMPT_HOMEPAGE:
        model_homepage = genai.GenerativeModel(
            model_name="gemini-2.5-pro-preview-05-06",
            safety_settings=safety_settings,
            generation_config=generation_config,
            system_instruction=GEMINI_SYSTEM_PROMPT_HOMEPAGE
        )
        print("Homepage generation model initialized.")
    else:
        print("Homepage system prompt not loaded. Homepage model NOT initialized.")

    processing_semaphore = asyncio.Semaphore(CONCURRENT_REQUESTS_LIMIT)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Determine the correct output folder name based on language configuration
    language_output_folder_name = os.getenv("NEXT_PUBLIC_TARGET_FOLDER_SLUG")

    if language_output_folder_name:
        print(f"Output folder set to '{language_output_folder_name}' based on NEXT_PUBLIC_TARGET_FOLDER_SLUG environment variable.")
    else:
        # Fallback logic if NEXT_PUBLIC_TARGET_FOLDER_SLUG is not set
        print(f"Warning: NEXT_PUBLIC_TARGET_FOLDER_SLUG not set. Determining output folder based on TARGET_LANGUAGE ('{TARGET_LANGUAGE}') and NEXT_PUBLIC_CONTENT_LANGUAGE.")
        if TARGET_LANGUAGE == "spanish" and os.getenv("NEXT_PUBLIC_CONTENT_LANGUAGE") == "es-MX":
            language_output_folder_name = "es-MX"
            print(f"Adjusted output folder to 'es-MX' based on TARGET_LANGUAGE=spanish and NEXT_PUBLIC_CONTENT_LANGUAGE=es-MX.")
        else:
            language_output_folder_name = TARGET_LANGUAGE # e.g., "english", "spanish"
            print(f"Using TARGET_LANGUAGE '{language_output_folder_name}' as output folder name.")
        
        # This case should ideally not be hit if TARGET_LANGUAGE is always set as per script start
        if not language_output_folder_name:
            print(f"Error: Critical - Output folder name could not be determined. TARGET_LANGUAGE ('{TARGET_LANGUAGE}') will be used.")
            language_output_folder_name = TARGET_LANGUAGE

    output_base_dir = os.path.join(script_dir, "content", language_output_folder_name)

    print(f"--- Phase 1: Generating Homepage Content for {language_output_folder_name} ({LANGUAGE_NAME_FOR_PROMPT}) ---")
    if model_homepage:
        homepage_output_dir = output_base_dir
        os.makedirs(homepage_output_dir, exist_ok=True)
        print(f"Output directory for homepage: {homepage_output_dir}")
        try:
            homepage_result = await process_homepage_content_async(processing_semaphore, homepage_output_dir)
            processing_summary.append(homepage_result)
            print(f"Homepage content generation completed. Result: {homepage_result.get('content_status')}")
        except Exception as e:
            print(f"Error during homepage generation: {e}")
            processing_summary.append({"type": "homepage", "filename": "homepage.md", "content_status": f"ERROR: {e}"})
    else:
        print(f"--- Skipping Homepage Content Generation for {language_output_folder_name} (model not initialized) ---")
        processing_summary.append({"type": "homepage", "filename": "homepage.md", "content_status": "SKIPPED - Model not initialized"})
    print(f"--- Phase 1 (Homepage) Completed ---")

    print(f"\n--- Phase 2: Generating Parent Category Content for {language_output_folder_name} ({LANGUAGE_NAME_FOR_PROMPT}) ---")
    parent_category_tasks = []
    if model_category:
        for parent_key_en in PARENT_CATEGORIES_EN:
            parent_slug_localized = current_lang_config["parent_category_slugs"].get(parent_key_en)
            parent_name_localized = current_lang_config["parent_category_names"].get(parent_key_en)

            if not parent_slug_localized or not parent_name_localized:
                print(f"  Warning: Missing localized slug or name for parent category EN key '{parent_key_en}' in {language_output_folder_name} config. Skipping.")
                processing_summary.append({"type": "parent_category", "parent_category_key_en": parent_key_en, "filename": "N/A", "content_status": f"SKIPPED - Missing slug/name in {language_output_folder_name} config"})
                continue

            current_parent_category_output_dir = os.path.join(output_base_dir, parent_slug_localized)
            os.makedirs(current_parent_category_output_dir, exist_ok=True)
            print(f"Output directory for parent category '{parent_name_localized}': {current_parent_category_output_dir}")

            example_subcategories_for_parent = []
            all_subcategories_for_this_parent_prompt = []

            if parent_key_en in SUBCATEGORIES_BY_PARENT_KEY:
                # Populate example_subcategories (first 3)
                for sub_key_en in SUBCATEGORIES_BY_PARENT_KEY[parent_key_en][:3]: # Limit examples
                    sub_slug_loc = current_lang_config["subcategory_slugs"].get(sub_key_en)
                    sub_name_loc = current_lang_config["subcategory_names"].get(sub_key_en)
                    if sub_slug_loc and sub_name_loc:
                        example_subcategories_for_parent.append({
                            "name_localized": sub_name_loc,
                            "slug_full_path_localized": f"/{parent_slug_localized}/{sub_slug_loc}",
                            "english_key": sub_key_en
                        })
                
                # Populate all_subcategories_for_this_parent_prompt (ALL subcategories)
                for sub_key_en in SUBCATEGORIES_BY_PARENT_KEY[parent_key_en]: # Iterate ALL
                    sub_slug_loc = current_lang_config["subcategory_slugs"].get(sub_key_en)
                    sub_name_loc = current_lang_config["subcategory_names"].get(sub_key_en)
                    # Ensure parent_slug_localized is available (it should be at this point)
                    if sub_slug_loc and sub_name_loc and parent_slug_localized:
                        all_subcategories_for_this_parent_prompt.append({
                            "name_localized": sub_name_loc,
                            "slug_full_path_localized": f"/{parent_slug_localized}/{sub_slug_loc}",
                            "english_key": sub_key_en
                        })


            other_parent_categories_for_prompt = [
                {
                    "name_localized": current_lang_config["parent_category_names"].get(pk),
                    "slug_localized": current_lang_config["parent_category_slugs"].get(pk)
                }
                for pk in PARENT_CATEGORIES_EN if pk != parent_key_en and \
                    current_lang_config["parent_category_names"].get(pk) and \
                    current_lang_config["parent_category_slugs"].get(pk)
            ]

            parent_input_data = {
                "parent_category_name_localized": parent_name_localized,
                "parent_category_slug_localized": parent_slug_localized,
                "parent_category_english_key": parent_key_en,
                "site_name": SITE_NAME_FOR_PROMPT,
                "site_description_short": SITE_DESCRIPTION_SHORT_FOR_PROMPT,
                "target_language_name": LANGUAGE_NAME_FOR_PROMPT,
                "example_subcategories": example_subcategories_for_parent, # Uses name_localized, slug_full_path_localized
                "all_subcategories_for_this_parent": all_subcategories_for_this_parent_prompt,
                "all_other_parent_categories": other_parent_categories_for_prompt # Uses name_localized, slug_localized
            }

            prospective_parent_filename = "index.md"
            parent_params = {
                "parent_input_json_str": json.dumps(parent_input_data, ensure_ascii=False, indent=2),
                "prospective_filename": prospective_parent_filename,
                "parent_key_en": parent_key_en,
                "parent_name_localized": parent_name_localized, # For logging
            }
            print(f"  Queueing PARENT category for generation: {parent_name_localized}")
            parent_category_tasks.append(process_parent_category_concurrently(parent_params, processing_semaphore, current_parent_category_output_dir))

        if parent_category_tasks:
            try:
                parent_results = await asyncio.gather(*parent_category_tasks)
                processing_summary.extend(parent_results)
                print(f"Parent category content generation completed for {language_output_folder_name}.")
            except Exception as e:
                print(f"Error during parent category generation batch: {e}")
                processing_summary.append({"type": "parent_category", "filename": "unknown_parent_on_error", "content_status": f"ERROR in batch: {e}"})
        else:
            print(f"No parent category tasks were queued for {language_output_folder_name}.")
    else:
        print(f"--- Skipping Parent Category Content Generation for {language_output_folder_name} (model not initialized) ---")
        processing_summary.append({"type": "parent_category", "filename": "N/A", "content_status": "SKIPPED - Model not initialized"})
    print(f"--- Phase 2 (Parent Categories) Completed ---")

    print(f"\n--- Phase 3: Generating Subcategory Content for {language_output_folder_name} ({LANGUAGE_NAME_FOR_PROMPT}) ---")
    subcategory_tasks = []
    if model_subcategory:
        for parent_key_en in PARENT_CATEGORIES_EN:
            parent_slug_localized = current_lang_config["parent_category_slugs"].get(parent_key_en)
            parent_name_localized = current_lang_config["parent_category_names"].get(parent_key_en)

            if not parent_slug_localized or not parent_name_localized:
                print(f"  Skipping subcategories for parent EN key '{parent_key_en}' as its localized slug/name is missing in {language_output_folder_name} config.")
                continue

            current_parent_subcategories_output_dir = os.path.join(output_base_dir, parent_slug_localized)
            os.makedirs(current_parent_subcategories_output_dir, exist_ok=True)
            print(f"Output directory for subcategories of '{parent_name_localized}': {current_parent_subcategories_output_dir}")

            subcategories_for_this_parent_en_keys = SUBCATEGORIES_BY_PARENT_KEY.get(parent_key_en, [])

            all_other_parent_categories_for_prompt = [
                {
                    "name_localized": current_lang_config["parent_category_names"].get(pk),
                    "slug_localized": current_lang_config["parent_category_slugs"].get(pk)
                }
                for pk in PARENT_CATEGORIES_EN if pk != parent_key_en and \
                    current_lang_config["parent_category_names"].get(pk) and \
                    current_lang_config["parent_category_slugs"].get(pk)
            ]

            for sub_key_en in subcategories_for_this_parent_en_keys:
                sub_slug_localized = current_lang_config["subcategory_slugs"].get(sub_key_en)
                sub_name_localized = current_lang_config["subcategory_names"].get(sub_key_en)

                if not sub_slug_localized or not sub_name_localized:
                    print(f"    Warning: Missing localized slug or name for subcategory EN key '{sub_key_en}' under parent '{parent_name_localized}' in {language_output_folder_name} config. Skipping.")
                    processing_summary.append({"type": "subcategory", "parent_category_key_en": parent_key_en, "subcategory_key_en": sub_key_en, "filename": "N/A", "content_status": f"SKIPPED - Missing slug/name in {language_output_folder_name} config"})
                    continue

                related_subcategories_for_prompt = []
                for related_sub_key_en in subcategories_for_this_parent_en_keys:
                    if related_sub_key_en == sub_key_en: continue
                    related_sub_slug_loc = current_lang_config["subcategory_slugs"].get(related_sub_key_en)
                    related_sub_name_loc = current_lang_config["subcategory_names"].get(related_sub_key_en)
                    if related_sub_slug_loc and related_sub_name_loc:
                        related_subcategories_for_prompt.append({
                            "name_localized": related_sub_name_loc,
                            "slug_localized": related_sub_slug_loc, # Prompt may need to construct full path with parent slug
                            "english_key": related_sub_key_en
                        })
                        if len(related_subcategories_for_prompt) >= 3: break # Limit examples

                subcategory_input_data = {
                    "subcategory_name_localized": sub_name_localized,
                    "subcategory_english_key": sub_key_en,
                    "parent_category_name_localized": parent_name_localized,
                    "parent_category_slug_localized": parent_slug_localized,
                    "current_subcategory_slug_localized": sub_slug_localized,
                    "site_name": SITE_NAME_FOR_PROMPT,
                    "site_description_short": SITE_DESCRIPTION_SHORT_FOR_PROMPT,
                    "target_language_name": LANGUAGE_NAME_FOR_PROMPT,
                    "all_other_parent_categories": all_other_parent_categories_for_prompt, # Uses name_localized, slug_localized
                    "related_subcategories_in_parent": related_subcategories_for_prompt # Uses name_localized, slug_localized
                }
                prospective_subcategory_filename = f"{sub_slug_localized}.md"

                sub_params = {
                    "subcategory_input_json_str": json.dumps(subcategory_input_data, ensure_ascii=False, indent=2),
                    "prospective_filename": prospective_subcategory_filename,
                    "parent_key_en": parent_key_en,
                    "parent_name_localized": parent_name_localized, # For logging
                    "subcat_key_en": sub_key_en,
                    "subcat_name_localized": sub_name_localized, # For logging
                }
                print(f"    Queueing SUBCATEGORY for generation: {parent_name_localized} -> {sub_name_localized}")
                subcategory_tasks.append(process_subcategory_concurrently(sub_params, processing_semaphore, current_parent_subcategories_output_dir))

        if subcategory_tasks:
            try:
                subcategory_results = await asyncio.gather(*subcategory_tasks)
                processing_summary.extend(subcategory_results)
                print(f"Subcategory content generation completed for {language_output_folder_name}.")
            except Exception as e:
                print(f"Error during subcategory generation batch: {e}")
                processing_summary.append({"type": "subcategory", "filename": "unknown_subcategory_on_error", "content_status": f"ERROR in batch: {e}"})
        else:
            print(f"No subcategory tasks were queued for {language_output_folder_name}.")
    else:
        print(f"--- Skipping Subcategory Content Generation for {language_output_folder_name} (model not initialized) ---")
        processing_summary.append({"type": "subcategory", "filename": "N/A", "content_status": "SKIPPED - Model not initialized"})
    print(f"--- Phase 3 (Subcategories) Completed ---")

    end_time = time.time()
    total_time = end_time - start_time
    print(f"\n--- All content generation finished in {total_time:.2f} seconds ---")

    summary_filename = f"content_generation_summary_{language_output_folder_name}_{time.strftime('%Y%m%d_%H%M%S')}.json"
    summary_filepath = os.path.join(script_dir, summary_filename)
    try:
        with open(summary_filepath, "w", encoding="utf-8") as f:
            json.dump(processing_summary, f, ensure_ascii=False, indent=2)
        print(f"Processing summary saved to: {summary_filepath}")
    except IOError as e:
        print(f"Failed to write processing summary: {e}")

if __name__ == "__main__":
    asyncio.run(main_async())