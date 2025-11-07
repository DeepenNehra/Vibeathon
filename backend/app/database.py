from supabase import create_client, Client
from typing import Optional, List, Dict, Any
import os
from dotenv import load_dotenv

load_dotenv()

class DatabaseClient:
    """Database client for Supabase operations"""
    
    def __init__(self):
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_KEY")
        
        if not supabase_url or not supabase_key:
            raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set")
        
        self.client: Client = create_client(supabase_url, supabase_key)
    
    async def append_transcript(
        self, 
        consultation_id: str, 
        speaker_id: str, 
        original_text: str, 
        translated_text: str
    ) -> None:
        """Append transcript entry to consultation"""
        # Fetch current transcript
        response = self.client.table("consultations").select("full_transcript").eq("id", consultation_id).single().execute()
        
        current_transcript = response.data.get("full_transcript", []) if response.data else []
        
        # Append new entry
        current_transcript.append({
            "speaker_id": speaker_id,
            "original_text": original_text,
            "translated_text": translated_text
        })
        
        # Update consultation
        self.client.table("consultations").update({
            "full_transcript": current_transcript
        }).eq("id", consultation_id).execute()
    
    async def get_full_transcript(self, consultation_id: str) -> List[Dict[str, str]]:
        """Retrieve full transcript for a consultation"""
        response = self.client.table("consultations").select("full_transcript").eq("id", consultation_id).single().execute()
        
        return response.data.get("full_transcript", []) if response.data else []
    
    async def save_soap_note(
        self, 
        consultation_id: str, 
        raw_soap_note: Dict[str, str], 
        de_stigma_suggestions: List[Dict[str, str]]
    ) -> None:
        """Save SOAP note and de-stigmatization suggestions"""
        self.client.table("consultations").update({
            "raw_soap_note": raw_soap_note,
            "de_stigma_suggestions": de_stigma_suggestions
        }).eq("id", consultation_id).execute()
    
    async def search_lexicon(self, query_embedding: List[float], threshold: float = 0.85) -> Optional[str]:
        """Search Community Lexicon using vector similarity"""
        # Note: This requires pgvector extension and proper RPC function in Supabase
        response = self.client.rpc(
            "match_lexicon_terms",
            {
                "query_embedding": query_embedding,
                "match_threshold": threshold,
                "match_count": 1
            }
        ).execute()
        
        if response.data and len(response.data) > 0:
            return response.data[0].get("term_english")
        
        return None
    
    async def add_lexicon_term(
        self, 
        term_english: str, 
        term_regional: str, 
        language: str, 
        embedding: List[float],
        doctor_id: str
    ) -> None:
        """Add new term to Community Lexicon"""
        self.client.table("medical_lexicon").insert({
            "term_english": term_english,
            "term_regional": term_regional,
            "language": language,
            "embedding": embedding,
            "verified_by_doctor_id": doctor_id
        }).execute()

# Singleton instance
db_client = DatabaseClient()
