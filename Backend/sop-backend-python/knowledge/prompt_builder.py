"""
Prompt assembler layer.

Turns a merged manifest (core + doc-type) into the system prompt text,
then wraps it as a cache-tagged content block for the Anthropic API.

This function is intentionally generic across all 4 families — it only
reads keys if they exist, so it works whether a manifest has "structure"
(family D style) or not. Keep manifest field names consistent
(structure: [{section, instruction}]) across future manifests so this
stays generic — don't let family_b/family_c manifests invent new key
names for the same concept.
"""


def render_system_prompt(manifest: dict, fact_sheet: dict = None) -> str:
    lines = [
        f"You are a professional visa-document writer producing a "
        f"{manifest['doc_type'].replace('_', ' ')} for a "
        f"{manifest['country'].title()} student visa application.\n"
        "To achieve a high 85+ compliance and quality score, your writing must adhere strictly to these core rules:\n"
        "1. Strictly factual: Seamlessly weave in specific names, degrees, CGPAs, timelines, and institutions from the applicant's fact-sheet.\n"
        "2. Zero Invented Details: You MUST ONLY state facts explicitly present in the provided fact-sheet. If a detail (such as marital status, spouse details, or prior visa refusals) is NOT in the fact-sheet, DO NOT invent, assume, or fabricate a value. Omit that topic entirely.\n"
        "3. Zero Repetition Across Paragraphs: Do not restate the target degree, target university, or post-graduation job title across multiple paragraphs. Each paragraph must own a distinct, unique topic.\n"
        "4. Strict Institution Fit (No Generic Praise): Any mention of the target university MUST be bound to a specific course module or lab. Generic praise like 'world-class faculty' or 'prestigious university' is strictly forbidden.\n"
        "5. Eradicate Hedging & Passive Voice: Write with absolute, evidence-backed certainty. Banned hedging phrases: 'I believe', 'I am confident', 'making me confident', 'I hope to', 'I expect to', 'I wish to', 'potentially'.\n"
        "6. Banglish & Multilingual Processing: The applicant fact-sheet may contain free-text fields written in Banglish (Bengali written in Roman/Latin script, e.g. 'ami oi 3 bochor porta pari nai...'), standard Bangla, or mixed-language text. You MUST accurately interpret the full underlying meaning (e.g. financial dependency, lack of family support, working to achieve self-sufficiency), translate it into formal professional English, and seamlessly incorporate the true reasons into the document without dropping or misinterpreting the applicant's context.\n\n"
        "FEW-SHOT CONTRAST EXAMPLES (Follow Good, Avoid Bad):\n"
        "- BAD (Hedging): 'I believe that this course will help me build on my existing skills, making me confident I will succeed.'\n"
        "- GOOD (Direct): 'This program equips me with advanced predictive modeling and cloud analytics capabilities.'\n\n"
        "- BAD (Generic Praise): 'RMIT University is a dream university with a prestigious reputation and world-class faculty.'\n"
        "- GOOD (Course-Bound Fit): 'RMIT University offers specialized modules in Practical Data Science and Machine Learning Algorithms.'\n\n"
        "- BAD (Repetition across sections): Paragraph 1: 'I plan to work as a Senior Data Consultant at Brain Station 23.' Paragraph 4: 'My ultimate goal is to work as a Senior Data Consultant at Brain Station 23.'\n"
        "- GOOD (Distinct ownership): Paragraph 1: 'My academic focus is big data analytics.' Paragraph 4: 'Upon graduation, I will join Brain Station 23 in Dhaka as a Senior Data Consultant.'"
    ]

    # Dynamic Forbidden/Required Topics Injection based on fact_sheet contents
    if fact_sheet:
        has_marital = bool(fact_sheet.get("marital_status") or fact_sheet.get("maritalStatus") or fact_sheet.get("spouse"))
        has_refusals = bool(fact_sheet.get("immigration_history") or fact_sheet.get("visa_refusals") or fact_sheet.get("visaRefusals") or fact_sheet.get("prior_refusals"))
        
        forbidden = []
        if not has_marital:
            forbidden.append("- MARITAL STATUS & SPOUSE: Do NOT mention marriage, single status, spouse, husband, wife, or marital background. This topic is NOT in the input data. Omit entirely.")
        else:
            lines.append("\n- MARITAL & SPOUSE DATA: The fact-sheet contains marital status or spouse information. Include it accurately where relevant (e.g. ties/background) without embellishing or inventing details beyond what is provided.")

        if not has_refusals:
            forbidden.append("- IMMIGRATION HISTORY & VISA REFUSALS: Do NOT mention, invent, or assume any prior visa refusals or prior visa grants. Omit the topic of visa refusals entirely.")
        else:
            lines.append("\n- IMMIGRATION & VISA REFUSAL DATA: The fact-sheet contains prior visa refusal details. Include them accurately (addressing the year, reason, and remedy) without fabricating additional facts.")

        if forbidden:
            lines.append("\n<forbidden_topics>")
            lines.append("CRITICAL DATA-SAFETY GUARD: The following topics are NOT present in the applicant fact-sheet. You are STRICTLY FORBIDDEN from generating statements about them:")
            lines += forbidden
            lines.append("</forbidden_topics>")

    if "language_rules" in manifest:
        lines.append(f"\nRegister: {manifest['language_rules']['register']}")
        lines.append("Principles:")
        lines += [f"- {p}" for p in manifest["language_rules"]["principles"]]

    if "tone" in manifest:
        lines.append(f"\nTone: {', '.join(manifest['tone'])}")

    if "structure_rules" in manifest:
        lines.append("\nGeneral structure rules:")
        lines += [f"- {r}" for r in manifest["structure_rules"]]

    if "goal" in manifest:
        lines.append(f"\nDocument goal: {manifest['goal']}")

    if "structure" in manifest:
        lines.append("\nRequired structure for this document:")
        for s in manifest["structure"]:
            lines.append(f"- {s['section']}: {s['instruction']}")

    if "structure_logic" in manifest:
        lines.append("\nOverall narrative logic:")
        for stage, meaning in manifest["structure_logic"].items():
            lines.append(f"- {stage.title()}: {meaning}")

    if "focus_areas" in manifest:
        lines.append("\nFocus areas: " + ", ".join(manifest["focus_areas"]))

    if "acceptable_reasons" in manifest:
        lines.append("\nAcceptable reasons (use only if applicant fact sheet supports one):")
        lines += [f"- {r}" for r in manifest["acceptable_reasons"]]

    if "red_flags" in manifest:
        lines.append("\nAvoid these red flags at all costs:")
        lines += [f"- {r}" for r in manifest["red_flags"]]

    if "avoid" in manifest:
        lines.append("\nAvoid:")
        lines += [f"- {a}" for a in manifest["avoid"]]

    if "banned_phrases" in manifest:
        lines.append(
            "\nNever use these phrases or close paraphrases of them: "
            + ", ".join(manifest["banned_phrases"])
        )

    if "preferred_replacements" in manifest:
        lines.append("\nPreferred replacements:")
        for bad, good in manifest["preferred_replacements"].items():
            lines.append(f'- Instead of "{bad}", write: "{good}"')

    if "preferred_language" in manifest:
        lines.append("\nPreferred phrasing patterns:")
        lines += [f"- {p}" for p in manifest["preferred_language"]]

    if "paragraph_focus" in manifest:
        lines.append("\nWhat each section should focus on (nothing more):")
        for section, focus in manifest["paragraph_focus"].items():
            lines.append(f"- {section}: {focus}")

    # Dynamic Writing Style override from user SaaS fact-sheet
    selected_style = None
    if fact_sheet:
        selected_style = fact_sheet.get("writingStyle") or fact_sheet.get("writing_style")

    if selected_style:
        lines.append(f"\nTarget Writing Style: {selected_style.title()}")
        if selected_style.lower() == "academic":
            lines.append("Style Guide: Focus on scholarly register, research fit, and intellectual progression. Use precise academic terminology.")
        elif selected_style.lower() == "professional":
            lines.append("Style Guide: Emphasize workplace experience, industry skills, career milestones, and a business-formal tone.")
        elif selected_style.lower() == "narrative":
            lines.append("Style Guide: Emphasize a personal storyline, origin of interest, and a smooth, engaging flow, while remaining formal.")
        elif selected_style.lower() == "direct":
            lines.append("Style Guide: Write in a highly concise, direct, and factual tone. Minimize decorative adjectives and get straight to the point.")
    elif "writing_style" in manifest:
        lines.append(f"\nWriting style: {', '.join(manifest['writing_style'])}")

    if "quality_checklist" in manifest:
        lines.append("\nBefore returning your answer, silently verify:")
        lines += [f"- {c}" for c in manifest["quality_checklist"]]

    # Applicant Voice Conditioning (Step 1)
    if fact_sheet:
        voice_sample = fact_sheet.get("applicant_voice_sample") or fact_sheet.get("applicantVoiceSample")
        if voice_sample and isinstance(voice_sample, str) and voice_sample.strip():
            sample_truncated = voice_sample.strip()[:500]
            lines.append(
                f"\nMatch this applicant's natural voice/phrasing style (don't copy content, facts, or personal details, only tone): {sample_truncated}"
            )

    return "\n".join(lines)


def build_cached_system_block(manifest: dict) -> list:
    """
    Returns the Anthropic `system` param value with a cache breakpoint.
    Same manifest -> same text -> cache hit on every subsequent call
    (Draft, then Edit, then every other student's generation for this
    country/doc_type until the manifest file changes).
    """
    return [
        {
            "type": "text",
            "text": render_system_prompt(manifest),
            "cache_control": {"type": "ephemeral"},
        }
    ]
