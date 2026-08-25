import re
import os
import json
import logging

logger = logging.getLogger(__name__)

BASE_REPLACEMENTS = {
    r"\bFurthermore,\b": ["Also,", "Additionally,", "In addition,"],
    r"\bfurthermore,\b": ["also,", "additionally,", "in addition,"],
    r"\bFurthermore\b": ["Also", "Additionally", "In addition"],
    r"\bfurthermore\b": ["also", "additionally", "in addition"],
    
    r"\bMoreover,\b": ["In addition,", "Additionally,", "Also,"],
    r"\bmoreover,\b": ["in addition,", "additionally,", "also,"],
    r"\bMoreover\b": ["In addition", "Additionally", "Also"],
    r"\bmoreover\b": ["in addition", "additionally", "also"],
    
    r"\bIn conclusion,\b": ["Overall,", "To sum up,", "Ultimately,"],
    r"\bin conclusion,\b": ["overall,", "to sum up,", "ultimately,"],
    r"\bIn conclusion\b": ["Overall", "To sum up", "Ultimately"],
    r"\bin conclusion\b": ["overall", "to sum up", "ultimately"],
    
    r"\bUndoubtedly,\b": ["Clearly,", "Indeed,", "Certainly,"],
    r"\bundoubtedly,\b": ["clearly,", "indeed,", "certainly,"],
    r"\bUndoubtedly\b": ["Clearly", "Indeed", "Certainly"],
    r"\bundoubtedly\b": ["clearly", "indeed", "certainly"],
    
    r"\bTherefore,\b": ["So,", "Hence,", "Thus,"],
    r"\btherefore,\b": ["so,", "hence,", "thus,"],
    r"\bTherefore\b": ["So", "Hence", "Thus"],
    r"\btherefore\b": ["so", "hence", "thus"],
    
    r"\bConsequently,\b": ["As a result,", "Therefore,", "So,"],
    r"\bconsequently,\b": ["as a result,", "therefore,", "so,"],
    r"\bConsequently\b": ["As a result", "Therefore", "So"],
    r"\bconsequently\b": ["as a result", "therefore", "so"],
    
    r"\bIt is important to note that\b": ["Note that", "Keep in mind that", "Importantly,"],
    r"\bit is important to note that\b": ["note that", "keep in mind that", "importantly,"],
    
    r"\bUtilize\b": ["Use", "Employ", "Apply"],
    r"\butilize\b": ["use", "employ", "apply"],
    r"\bUtilizes\b": ["Uses", "Employs", "Applies"],
    r"\butilizes\b": ["uses", "employs", "applies"],
    r"\bUtilizing\b": ["Using", "Employing", "Applying"],
    r"\butilizing\b": ["using", "employing", "applying"],
    
    r"\bCommence\b": ["Start", "Begin", "Launch"],
    r"\bcommence\b": ["start", "begin", "launch"],

    # Hedging phrase cleanups
    r"\bI am confident that\b": ["My background ensures", "I am prepared to"],
    r"\bi am confident that\b": ["my background ensures", "I am prepared to"],
    r"\bI believe that\b": ["My analysis indicates that", "My experience demonstrates"],
    r"\bi believe that\b": ["my analysis indicates that", "my experience demonstrates"],
    r"\bI have a clear understanding of\b": ["I thoroughly comprehend", "I am well-versed in"],
    r"\bi have a clear understanding of\b": ["I thoroughly comprehend", "I am well-versed in"],
    r"\bI am aware of\b": ["I have accounted for", "I am prepared for"],
    r"\bi am aware of\b": ["I have accounted for", "I am prepared for"],
}

def clean_phrase(p: str) -> str:
    return re.sub(r"[^\w\s]", "", p).strip().lower()

# Build the union of all core.json banned phrases at load time
MANIFEST_ROOT = os.path.join(os.path.dirname(__file__), "manifests")

def _load_all_banned_phrases() -> set[str]:
    banned_set = set()
    if not os.path.exists(MANIFEST_ROOT):
        return banned_set
        
    for root, dirs, files in os.walk(MANIFEST_ROOT):
        if "core.json" in files:
            core_path = os.path.join(root, "core.json")
            try:
                with open(core_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    phrases = data.get("banned_phrases", [])
                    for phrase in phrases:
                        if phrase:
                            banned_set.add(clean_phrase(phrase))
            except Exception as e:
                print(f"⚠️ Error loading core.json from {core_path}: {e}")
    return banned_set

GLOBAL_BANNED_UNION = _load_all_banned_phrases()

# Filter BASE_REPLACEMENTS using GLOBAL_BANNED_UNION
REPLACEMENTS = {}
for pattern, candidates in BASE_REPLACEMENTS.items():
    filtered_candidates = []
    for cand in candidates:
        if clean_phrase(cand) not in GLOBAL_BANNED_UNION:
            filtered_candidates.append(cand)
    REPLACEMENTS[pattern] = filtered_candidates if filtered_candidates else candidates

def humanize(text: str, manifest: dict = None) -> str:
    """
    Deterministic rule-based humanizer.
    Replaces robotic, repetitive, and AI-typical words/transitions
    with natural, conversational equivalents while avoiding banned phrases.
    """
    if not text:
        return text

    banned_phrases = []
    if manifest:
        banned_phrases = manifest.get("banned_phrases", [])

    banned_set = {clean_phrase(bp) for bp in banned_phrases if bp}
    current_text = text

    for pattern, candidates in REPLACEMENTS.items():
        if not re.search(pattern, current_text):
            continue

        safe_replacement = None
        for cand in candidates:
            cleaned_cand = clean_phrase(cand)
            if cleaned_cand not in banned_set and cleaned_cand not in GLOBAL_BANNED_UNION:
                safe_replacement = cand
                break

        if safe_replacement is not None:
            current_text = re.sub(pattern, safe_replacement, current_text)
        else:
            word_clean = re.sub(r"\\[bB]", "", pattern).strip()
            country = manifest.get("country") if manifest else "unknown"
            doc_type = manifest.get("doc_type") if manifest else "unknown"
            logger.warning(f"humanizer: no safe replacement for '{word_clean}' in {country}/{doc_type}")

    return current_text
