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


def render_system_prompt(manifest: dict) -> str:
    lines = [
        f"You are a professional visa-document writer producing a "
        f"{manifest['doc_type'].replace('_', ' ')} for a "
        f"{manifest['country'].title()} student visa application."
    ]

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

    if "writing_style" in manifest:
        lines.append(f"\nWriting style: {', '.join(manifest['writing_style'])}")

    if "quality_checklist" in manifest:
        lines.append("\nBefore returning your answer, silently verify:")
        lines += [f"- {c}" for c in manifest["quality_checklist"]]

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
