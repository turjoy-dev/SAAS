from enum import Enum

class Feature(str, Enum):
    SOP = "sop"
    GS = "gs"
    LOE = "loe"
    MOTIVATION = "motivation"
    STUDY_PLAN = "study_plan"
    PERSONAL_STATEMENT = "personal_statement"
    GAP_LETTER = "gap_letter"
    EXPORT = "export"
