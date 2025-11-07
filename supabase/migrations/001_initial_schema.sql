-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Patients table
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    preferred_language TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Consultations table
CREATE TABLE consultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    consultation_date TIMESTAMPTZ DEFAULT NOW(),
    full_transcript TEXT DEFAULT '',
    raw_soap_note JSONB,
    de_stigma_suggestions JSONB,
    approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medical lexicon table with vector embeddings
CREATE TABLE medical_lexicon (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    term_english TEXT NOT NULL,
    term_regional TEXT NOT NULL,
    language TEXT NOT NULL,
    verified_by_doctor_id UUID NOT NULL REFERENCES auth.users(id),
    embedding vector(384) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes on foreign keys for better query performance
CREATE INDEX idx_consultations_patient ON consultations(patient_id);
CREATE INDEX idx_consultations_doctor ON consultations(doctor_id);
CREATE INDEX idx_lexicon_doctor ON medical_lexicon(verified_by_doctor_id);

-- Create IVFFlat index on vector column for similarity search
CREATE INDEX idx_lexicon_embedding ON medical_lexicon 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
