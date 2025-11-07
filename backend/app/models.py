from pydantic import BaseModel, Field
from typing import List, Optional

class LexiconTerm(BaseModel):
    """Model for Community Lexicon term submission"""
    term_english: str = Field(..., description="Medical term in English")
    term_regional: str = Field(..., description="Medical term in regional language")
    language: str = Field(..., description="Language code (e.g., 'hi' for Hindi)")

class StigmaSuggestion(BaseModel):
    """Model for de-stigmatization suggestion"""
    original_phrase: str = Field(..., description="Original stigmatizing phrase")
    suggested_alternative: str = Field(..., description="Person-first alternative")
    rationale: str = Field(..., description="Explanation for the suggestion")
    section: str = Field(..., description="SOAP section (assessment or plan)")

class SoapNoteResponse(BaseModel):
    """Model for SOAP note structure"""
    subjective: str = Field(..., description="Subjective section")
    objective: str = Field(..., description="Objective section")
    assessment: str = Field(..., description="Assessment section")
    plan: str = Field(..., description="Plan section")

class SoapGenerationResponse(BaseModel):
    """Model for complete SOAP generation response"""
    raw_soap_note: SoapNoteResponse
    de_stigma_suggestions: List[StigmaSuggestion]
    consultation_id: str
