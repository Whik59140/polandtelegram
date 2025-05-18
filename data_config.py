import json
import re
import os

# Parent Category Keys (English) - These define the site structure
# This needs to be defined before _load_data_from_translations_ts can use it to extract parent names.
PARENT_CATEGORIES_EN = [
    "groups",
    "channels",
    "videos",
    "chat",
]

def _clean_and_parse_js_object_literal(object_literal_str: str, object_name_for_error: str, ts_file_path_for_error: str) -> dict:
    """
    Cleans a JavaScript object literal string (as used in translations.ts for simple objects)
    and parses it into a Python dictionary.
    - Removes JavaScript line comments (// ...).
    - Ensures keys are double-quoted.
    - Converts single-quoted string values to double-quoted.
    - Removes trailing commas.
    """
    # Remove JavaScript line comments
    object_literal_str = re.sub(r"//.*?\n", "\n", object_literal_str) # Remove full line comments
    object_literal_str = re.sub(r"//.*", "", object_literal_str) # Remove trailing comments on lines with code

    object_literal_str = object_literal_str.strip().rstrip(';')
    # Ensure keys are double-quoted (handles unquoted, single-quoted, or already double-quoted keys)
    object_literal_str = re.sub(r"(['\"])?([a-zA-Z0-9_]+)([\'\"])?\s*:", r'"\2":', object_literal_str)
    # Replace single quotes for string values with double quotes
    # Handles escaped single quotes within the value: 'it\\'s value' -> "it's value"
    object_literal_str = re.sub(r":\s*'((?:\\'|[^'])*)'", lambda m: ': "' + m.group(1).replace("\\'", "'") + '"', object_literal_str)
    # Remove trailing commas before a closing brace } or bracket ]
    object_literal_str = re.sub(r",\s*([}\]])", r"\1", object_literal_str)

    try:
        return json.loads(object_literal_str)
    except json.JSONDecodeError as e:
        error_msg = (
            f"Error decoding JSON for '{object_name_for_error}' from '{ts_file_path_for_error}': {e}\\n"
            f"Content that failed to parse for '{object_name_for_error}':\\n{object_literal_str}\\n"
            "Ensure that in the TypeScript file, this object's string values are simple strings "
            "(double or single quoted) or are properly escaped for JSON compatibility. "
            "Complex template literals `${...}` within these specific name/slug definitions are not directly parsed by this function."
        )
        # Create a new exception to carry the more detailed message
        new_exc = json.JSONDecodeError(msg=error_msg, doc=object_literal_str, pos=e.pos)
        raise new_exc from e

def _load_data_from_translations_ts():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    ts_file_path = os.path.join(current_dir, "lib", "translations.ts")

    if not os.path.exists(ts_file_path):
        raise FileNotFoundError(f"Translations file not found: {ts_file_path}")

    with open(ts_file_path, 'r', encoding='utf-8') as f:
        ts_content = f.read()

    # 1. Load Parent Category Slugs
    parent_slugs_match = re.search(r"const\s+englishParentCategorySlugsMap\s*:\s*Record<ParentCategoryKey,\s*string>\s*=\s*({.*?});", ts_content, re.DOTALL)
    if not parent_slugs_match:
        # Fallback for different formatting if Record<...> is missing or different
        parent_slugs_match = re.search(r"const\s+englishParentCategorySlugsMap\s*=\s*({.*?});", ts_content, re.DOTALL)
    if not parent_slugs_match:
        raise ValueError(f"Could not find 'englishParentCategorySlugsMap' in '{ts_file_path}'")
    parent_category_slugs = _clean_and_parse_js_object_literal(parent_slugs_match.group(1), "englishParentCategorySlugsMap", ts_file_path)

    # 2. Load Subcategory Slugs
    sub_slugs_match = re.search(r"const\s+englishSubcategorySlugsMap\s*:\s*Record<SubcategoryKey,\s*string>\s*=\s*({.*?});", ts_content, re.DOTALL)
    if not sub_slugs_match:
        sub_slugs_match = re.search(r"const\s+englishSubcategorySlugsMap\s*=\s*({.*?});", ts_content, re.DOTALL)
    if not sub_slugs_match:
        raise ValueError(f"Could not find 'englishSubcategorySlugsMap' in '{ts_file_path}'")
    subcategory_slugs = _clean_and_parse_js_object_literal(sub_slugs_match.group(1), "englishSubcategorySlugsMap", ts_file_path)
    
    # 3. Extract siteStrings object content
    site_strings_obj_match = re.search(r"export\s+const\s+siteStrings\s*=\s*({(.*)});", ts_content, re.DOTALL)
    if not site_strings_obj_match:
        raise ValueError(f"Could not find 'siteStrings' object in '{ts_file_path}'")
    site_strings_content = site_strings_obj_match.group(1) # This is the full "{...}"

    # 4. Load Subcategory Names from siteStrings.subcategories
    sub_names_literal_match = re.search(r"subcategories\s*:\s*({[^{}]*})", site_strings_content, re.DOTALL)
    if not sub_names_literal_match:
        raise ValueError(f"Could not find 'siteStrings.subcategories' in '{ts_file_path}'")
    subcategory_names = _clean_and_parse_js_object_literal(sub_names_literal_match.group(1), "siteStrings.subcategories", ts_file_path)

    # 5. Load Parent Category Names from siteStrings.categories.*.title
    parent_category_names = {}
    categories_literal_match = re.search(r"categories\s*:\s*({(.*)}\s*),", site_strings_content, re.DOTALL)
    if not categories_literal_match:
         # Try without trailing comma for the categories block itself if it's the last major key in siteStrings
        categories_literal_match = re.search(r"categories\s*:\s*({(.*)}\s*)\s*}", site_strings_content, re.DOTALL)
        if not categories_literal_match: # Try to match the categories block more generally
             categories_literal_match = re.search(r"categories\s*:\s*({(?:[^{}]|{[^{}]*})*})", site_strings_content, re.DOTALL)


    if not categories_literal_match:
        raise ValueError(f"Could not find 'siteStrings.categories' block in '{ts_file_path}'")
    
    categories_block_content = categories_literal_match.group(1) # The full categories: { ... } block

    for p_key in PARENT_CATEGORIES_EN:
        # Regex to find title for each parent category key within the categories_block_content
        # Example for 'groups': groups\s*:\s*{\s*[^}]*?title\s*:\s*"([^"]*)"
        title_match = re.search(rf"{p_key}\s*:\s*{{(?:[^{{}}]|{{[^{{}}]*}})*?title\s*:\s*\"([^\"]*)\"", categories_block_content, re.DOTALL)
        if title_match:
            parent_category_names[p_key] = title_match.group(1)
        else:
            # Try to parse the individual parent category object if the regex above fails
            p_key_object_match = re.search(rf"{p_key}\s*:\s*({{.*?}})", categories_block_content, re.DOTALL)
            if p_key_object_match:
                try:
                    p_key_obj_parsed = _clean_and_parse_js_object_literal(p_key_object_match.group(1), f"siteStrings.categories.{p_key}", ts_file_path)
                    if "title" in p_key_obj_parsed:
                         parent_category_names[p_key] = p_key_obj_parsed["title"]
                    else:
                        print(f"Warning: 'title' not found for parent category '{p_key}' in parsed object from translations.ts")
                except Exception as e_parse:
                    print(f"Warning: Could not parse object for parent category '{p_key}' or find title: {e_parse}")
            else:
                 print(f"Warning: Could not find title for parent category '{p_key}' in translations.ts")


    return parent_category_slugs, subcategory_slugs, parent_category_names, subcategory_names

# Load all data from translations.ts
try:
    PARENT_CATEGORY_EN_SLUGS, SUBCATEGORY_EN_SLUGS, \
    PARENT_CATEGORY_EN_TO_EN_NAME, SUBCATEGORY_EN_TO_EN_NAME = _load_data_from_translations_ts()
except Exception as e:
    print(f"FATAL ERROR loading data from translations.ts: {e}")
    # Exit or set to empty dicts to avoid crashing subsequent parts of the script during init
    PARENT_CATEGORY_EN_SLUGS, SUBCATEGORY_EN_SLUGS = {}, {}
    PARENT_CATEGORY_EN_TO_EN_NAME, SUBCATEGORY_EN_TO_EN_NAME = {}, {}
    # It might be better to re-raise or sys.exit(1) here
    raise

# Subcategory Keys (English) - These define the site structure
# Based on translations.ts siteStrings.subcategories
SUBCATEGORIES_EN = list(SUBCATEGORY_EN_SLUGS.keys()) # Derive from loaded slugs/names

# Mapping of parent category keys to a list of their subcategory keys (English)
SUBCATEGORIES_BY_PARENT_KEY = {
    "groups": list(SUBCATEGORIES_EN), 
    "channels": list(SUBCATEGORIES_EN),
    "videos": list(SUBCATEGORIES_EN),
    "chat": list(SUBCATEGORIES_EN),
}
# It's highly recommended to refine SUBCATEGORIES_BY_PARENT_KEY for better relevance.

# --- Language Specific Configurations ---
LANG_CONFIGS = {
    "english": {
        "language_name": "English",
        "country_name": os.environ.get("NEXT_PUBLIC_COUNTRY_NAME", "USA"), # Get from env
        "country_flag": os.environ.get("NEXT_PUBLIC_COUNTRY_FLAG", "🇺🇸"), # Get from env
        "SITE_NAME_PROMPT": os.environ.get("NEXT_PUBLIC_SITE_NAME", "Telegram USA"), # Get from env
        "SITE_DESCRIPTION_PROMPT": "Your central portal for discovering a variety of adult content on Telegram, including groups, channels, videos, and interactive chats.", # Generic, or make template
        "PROMPT_FILES": {
            "subcategory": "gemini_sub.txt",
            "subcategory_cluster": "gemini_sub_cluster.txt",
            "homepage": "gemini_homepage.txt", 
            "category": "gemini_category.txt", 
            "blog_post": "gemini_blog_post.txt", 
            "about_page": "gemini_about_page.txt", 
            "privacy_policy_page": "gemini_privacy_policy.txt"
        },
        "parent_category_names": PARENT_CATEGORY_EN_TO_EN_NAME,
        "subcategory_names": SUBCATEGORY_EN_TO_EN_NAME,
        "parent_category_slugs": PARENT_CATEGORY_EN_SLUGS,
        "subcategory_slugs": SUBCATEGORY_EN_SLUGS,
        "default_page_title_suffix": "Groups, Channels, Videos & Chats", # From translations.ts common?
        # Templates for text generation - these can reference {country_name}, {site_name_prompt} etc.
        "home_meta_title_template": "Telegram {country_name}: Groups, Channels, Videos & Chats",
        "home_meta_description_template": "Find and explore the best Telegram groups, channels, videos, and chats in {country_name}. Updated adult content.",
        "home_title_template": "Welcome to {site_name_prompt}",
        "home_intro_template": "Your primary source for discovering Telegram groups, channels, videos, and chats in {country_name}.",
        
        "category_meta_title_template": "{parent_category_name} | Telegram {country_name}",
        "category_meta_description_template": "Discover and filter {parent_category_name} on Telegram for adults in {country_name}.",
        "category_title_template": "{parent_category_name}", # Title is direct name
        "category_description_template": "Explore the best {parent_category_name} for adults in {country_name}. Updated daily.",

        "blog_meta_title_template": "Telegram {country_name} Blog: Tips, Guides, and Updates",
        "blog_meta_description_template": "Explore our blog for the latest tips, detailed guides, and updates about Telegram in {country_name}. Maximize your experience.",
        "blog_page_title_template": "Our Telegram Blog",
        
        "faq_page_title_template": "Frequently Asked Questions (FAQ)", # Generic
        
        "about_page_meta_title_template": "About Us | Telegram {country_name}",
        "about_page_meta_description_template": "Learn more about {site_name_prompt}, your guide for adult content on Telegram in {country_name}.",
        "about_page_title_template": "About Us",
        
        "privacy_page_meta_title_template": "Privacy Policy | Telegram {country_name}",
        "privacy_page_meta_description_template": "Read our privacy policy for {site_name_prompt}.",
        "privacy_page_title_template": "Privacy Policy",
        
        "subcategory_page_title_template": "{subcategory_name} {parent_category_name} - {site_name_prompt}", # Requires singular parent name
        "subcategory_page_description_template": "Discover the best {subcategory_name} content in the {parent_category_name} section on {site_name_prompt}.",
        "subcategory_page_meta_description_template": "Find links and resources for {subcategory_name} under {parent_category_name} on {site_name_prompt}. Explore our collection."
    },
    "polish": {
        "language_name": "Polski",
        "country_name": os.environ.get("NEXT_PUBLIC_COUNTRY_NAME", "Polska"),
        "country_flag": os.environ.get("NEXT_PUBLIC_COUNTRY_FLAG", "🇵🇱"),
        "SITE_NAME_PROMPT": os.environ.get("NEXT_PUBLIC_SITE_NAME", "Telegram Polska"),
        "SITE_DESCRIPTION_PROMPT": "Twoje centralne miejsce do odkrywania różnorodnych treści dla dorosłych na Telegramie, w tym grup, kanałów, filmów i interaktywnych czatów.",
        "PROMPT_FILES": {
            "subcategory": "gemini_sub.txt",
            "subcategory_cluster": "gemini_sub_cluster.txt",
            "homepage": "gemini_homepage.txt",
            "category": "gemini_category.txt",
            "blog_post": "gemini_blog_post.txt",
            "about_page": "gemini_about_page.txt",
            "privacy_policy_page": "gemini_privacy_policy.txt"
        },
        "parent_category_names": PARENT_CATEGORY_EN_TO_EN_NAME, # Needs Polish version from translations.ts
        "subcategory_names": SUBCATEGORY_EN_TO_EN_NAME, # Needs Polish version from translations.ts
        "parent_category_slugs": PARENT_CATEGORY_EN_SLUGS, # Needs Polish version from translations.ts
        "subcategory_slugs": SUBCATEGORY_EN_SLUGS, # Needs Polish version from translations.ts
        "default_page_title_suffix": "Grupy, Kanały, Wideo & Czaty",
        "home_meta_title_template": "Telegram {country_name}: Grupy, Kanały, Wideo & Czaty",
        "home_meta_description_template": "Znajdź i odkrywaj najlepsze grupy, kanały, filmy i czaty Telegram w {country_name}. Zaktualizowane treści dla dorosłych.",
        "home_title_template": "Witamy w {site_name_prompt}",
        "home_intro_template": "Twoje główne źródło do odkrywania grup, kanałów, filmów i czatów Telegram w {country_name}.",
        "category_meta_title_template": "{parent_category_name} | Telegram {country_name}",
        "category_meta_description_template": "Odkrywaj i filtruj {parent_category_name} na Telegramie dla dorosłych w {country_name}.",
        "category_title_template": "{parent_category_name}",
        "category_description_template": "Przeglądaj najlepsze {parent_category_name} dla dorosłych w {country_name}. Aktualizowane codziennie.",
        "blog_meta_title_template": "Blog Telegram {country_name}: Porady, Przewodniki i Aktualizacje",
        "blog_meta_description_template": "Przeglądaj naszego bloga, aby znaleźć najnowsze porady, szczegółowe przewodniki i aktualizacje dotyczące Telegrama w {country_name}. Zmaksymalizuj swoje doświadczenie.",
        "blog_page_title_template": "Nasz Blog Telegram",
        "faq_page_title_template": "Często Zadawane Pytania (FAQ)",
        "about_page_meta_title_template": "O nas | Telegram {country_name}",
        "about_page_meta_description_template": "Dowiedz się więcej o {site_name_prompt}, Twoim przewodniku po treściach dla dorosłych na Telegramie w {country_name}.",
        "about_page_title_template": "O nas",
        "privacy_page_meta_title_template": "Polityka Prywatności | Telegram {country_name}",
        "privacy_page_meta_description_template": "Przeczytaj naszą politykę prywatności dla {site_name_prompt}.",
        "privacy_page_title_template": "Polityka Prywatności",
        "subcategory_page_title_template": "{subcategory_name} {parent_category_name} - {site_name_prompt}",
        "subcategory_page_description_template": "Odkryj najlepsze treści {subcategory_name} w sekcji {parent_category_name} na {site_name_prompt}.",
        "subcategory_page_meta_description_template": "Znajdź linki i zasoby dla {subcategory_name} w kategorii {parent_category_name} na {site_name_prompt}. Poznaj naszą kolekcję."
    }
}

# Helper to get singular form (very basic, extend as needed)
def get_singular_form(plural_name):
    if plural_name.endswith("s"):
        return plural_name[:-1]
    return plural_name

# Post-process LANG_CONFIGS to add singular names if needed by templates
for lang_code, config in LANG_CONFIGS.items():
    if "parent_category_names" in config:
        singular_parent_names = {
            key: get_singular_form(name) for key, name in config["parent_category_names"].items()
        }
        config["parent_category_names_singular"] = singular_parent_names
    
    # Example usage in templates:
    # config["subcategory_page_title_template"] = "{subcategory_name} {parent_category_names_singular[parent_key]} - {site_name_prompt}"
    # This requires the parent_key to be available during template rendering.
    # The current template for subcategory uses {parent_category_name} which is fine if it refers to the plural.
    # Let's adjust the subcategory templates slightly if they use "parent_category_name" it refers to the plural version.
    # If a specific singular version is needed, the generation script must fetch it.
    config["subcategory_page_title_template"] = "{subcategory_name} {parent_category_name} - {site_name_prompt}"
    config["subcategory_page_description_template"] = "Discover the best {subcategory_name} content in the {parent_category_name} section on {site_name_prompt}."
    config["subcategory_page_meta_description_template"] = "Find links and resources for {subcategory_name} under {parent_category_name} on {site_name_prompt}. Explore our collection."

# Default to English if TARGET_LANGUAGE is not set or not found
target_lang = os.getenv("TARGET_LANGUAGE", "english").lower()
# Ensure the target_lang exists in LANG_CONFIGS, otherwise default to English
if target_lang not in LANG_CONFIGS:
    print(f"Warning: Language '{target_lang}' not found in LANG_CONFIGS. Defaulting to English.")
    target_lang = "english"

active_lang_config = LANG_CONFIGS[target_lang]

# You might want to replace specific uses of config_en later on,
# or assign active_lang_config to a more general variable name
# For now, let's assume config_en was a placeholder for the active config
config_en = active_lang_config

if __name__ == "__main__":
    print("--- Configuration Check for English ('english') ---")

    if "english" not in LANG_CONFIGS:
        print("ERROR: English ('english') configuration missing in LANG_CONFIGS.")
        exit()
    
    config_en = LANG_CONFIGS["english"]
    # Required keys in the main 'english' config
    required_config_keys = [
        "language_name", "country_name", "country_flag", 
        "SITE_NAME_PROMPT", "SITE_DESCRIPTION_PROMPT", "PROMPT_FILES",
        "parent_category_names", "subcategory_names",
        "parent_category_slugs", "subcategory_slugs",
        "default_page_title_suffix" 
        # Add other top-level template keys if they are strictly required for all operations
    ]
    # Required keys within PROMPT_FILES
    required_prompt_files = [
        "subcategory", "subcategory_cluster", "homepage", "category", 
        "blog_post", "about_page", "privacy_policy_page"
    ]

    all_keys_present = True
    for req_key in required_config_keys:
        if req_key not in config_en:
            print(f"ERROR: Required key '{req_key}' missing in LANG_CONFIGS['english'].")
            all_keys_present = False
        elif config_en[req_key] is None or (isinstance(config_en[req_key], (dict, list, str)) and not config_en[req_key]):
             # Check for None or empty collections/strings
             print(f"ERROR: Key '{req_key}' in LANG_CONFIGS['english'] is empty or None.")
             all_keys_present = False
    
    if "PROMPT_FILES" in config_en:
        for req_pf_key in required_prompt_files:
            if req_pf_key not in config_en["PROMPT_FILES"]:
                print(f"ERROR: Required prompt file key '{req_pf_key}' missing in LANG_CONFIGS['english']['PROMPT_FILES'].")
                all_keys_present = False
            elif not config_en["PROMPT_FILES"].get(req_pf_key):
                print(f"ERROR: Prompt file for '{req_pf_key}' in LANG_CONFIGS['english']['PROMPT_FILES'] is empty.")
                all_keys_present = False
    else:
        print("ERROR: 'PROMPT_FILES' key missing in LANG_CONFIGS['english'].")
        all_keys_present = False

    if not all_keys_present: exit()

    print("\n--- Parent Category Consistency Checks (English) ---")
    for pk_en in PARENT_CATEGORIES_EN:
        if pk_en not in config_en["parent_category_slugs"]:
            print(f"ERROR: Parent key '{pk_en}' missing slug in English parent_category_slugs.")
        if pk_en not in config_en["parent_category_names"]:
            print(f"ERROR: Parent key '{pk_en}' missing name in English parent_category_names.")

    print("\n--- Subcategory Consistency Checks (English) ---")
    # SUBCATEGORIES_EN is now derived from loaded slugs, so it should be consistent with subcategory_slugs keys.
    # We need to ensure all keys in subcategory_slugs also have names.
    for sk_en in config_en["subcategory_slugs"].keys():
        if sk_en not in config_en["subcategory_names"]:
            print(f"ERROR: Subcategory key '{sk_en}' (from slugs) missing name in English subcategory_names.")
    for sk_en in config_en["subcategory_names"].keys():
        if sk_en not in config_en["subcategory_slugs"]:
            print(f"ERROR: Subcategory key '{sk_en}' (from names) missing slug in English subcategory_slugs.")


    print("\n--- SUBCATEGORIES_BY_PARENT_KEY Structure Check ---")
    # Re-derive SUBCATEGORIES_EN from the primary source of subcategory keys if necessary
    # For this check, we use the keys from the loaded subcategory_slugs map
    defined_subcategories_set = set(config_en["subcategory_slugs"].keys())

    all_mapped_subcategories_in_sbpk = set()
    for parent_key, subcat_keys_in_sbpk in SUBCATEGORIES_BY_PARENT_KEY.items():
        if parent_key not in PARENT_CATEGORIES_EN:
            print(f"ERROR: Parent key '{parent_key}' in SUBCATEGORIES_BY_PARENT_KEY is not in PARENT_CATEGORIES_EN.")
        for subcat_key_in_sbpk in subcat_keys_in_sbpk:
            if subcat_key_in_sbpk not in defined_subcategories_set:
                print(f"ERROR: Subcategory key '{subcat_key_in_sbpk}' for parent '{parent_key}' in SUBCATEGORIES_BY_PARENT_KEY is not a defined subcategory.")
            all_mapped_subcategories_in_sbpk.add(subcat_key_in_sbpk)
    
    unmapped_defined_subcategories = defined_subcategories_set - all_mapped_subcategories_in_sbpk
    if unmapped_defined_subcategories:
        print(f"WARNING: {len(unmapped_defined_subcategories)} defined subcategories are not mapped in SUBCATEGORIES_BY_PARENT_KEY: {unmapped_defined_subcategories}")
    else:
        print("All defined subcategories are present as values in SUBCATEGORIES_BY_PARENT_KEY.")

    # Check if all parent categories are keys in SUBCATEGORIES_BY_PARENT_KEY
    mapped_parent_categories_in_sbpk = set(SUBCATEGORIES_BY_PARENT_KEY.keys())
    unmapped_parent_categories = set(PARENT_CATEGORIES_EN) - mapped_parent_categories_in_sbpk
    if unmapped_parent_categories:
        print(f"WARNING: {len(unmapped_parent_categories)} parent categories from PARENT_CATEGORIES_EN are not keys in SUBCATEGORIES_BY_PARENT_KEY: {unmapped_parent_categories}")
    else:
        print("All parent categories from PARENT_CATEGORIES_EN are present as keys in SUBCATEGORIES_BY_PARENT_KEY.")
    
    print("\n--- Basic Configuration Checks Complete ---")
    print("Review SUBCATEGORIES_BY_PARENT_KEY for optimal relevance of subcategories to parent categories.") 