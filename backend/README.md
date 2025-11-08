# Arogya-AI Backend

FastAPI backend for the ysis.

ures

ket
- Speech-to-text with Hinglish sort
- Live sh)
- Medical alert detm
- AI-powered SOAP note generation
- Cch

## Installation

```bash
cd d

# Create virtual environment
python 

# Activate virtual environment
souinux
# or
venv\Scripts\activate  # On Wiows

# Install dependencies
pip insts.txt
```

## Configu

```bash

# Edit .env with your API keys and credentials
``

### Required Environment Variables

```bash
# Google Cloud Credentials (REQUIRED for tions)


# OpenAI API Key (OPTIONAL - Fallback ASR)
OPENAI_API_KEY=sk-proj-...your_key_here

# Database Connection
DATABASE_URL=postgresql://user:password@host:port/database
```

## Quick Start

```bash
er
uvicorn app.main:ap
```

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:c

les

### Alert Engine (`app/alert_engine.py`)

Rea

**Features:**
- Pattern-based symptom detectionx
- Context-aware severity scoring (1-5 scale)
- Alert deduplication (5-minute timeout)
- Support for multiple symptom categories

*
- `chest_pain` - Cty: 5)
- `breathing` - Difficulty breathing, shortness of bre)
- `consciousness` - Loss of consciousness, fainting (sev5)
- `bleeding` - Severe bleeding, hemorrhag4)
)
- `neurological)

**Usage
```python
ine

engine = AlertEngine

alert = await engine.analyze_tpt(
    text="I'm having severe chest pain",
    ,
    speaker_type="patient"
)

if alert:
   
```

s


- Analyzes transcript text for critioms
- Reque
  ```json
  {
   t",
n-id",
    "speaker_type": "patient"
  }
  ```

**P
tion

**GET /patterns**
- Returns all configured symptom

ture

```
backend/
├── app/
│   ├── main.py              # FastAPI app initialization
els
│   ├── database.py          # Supaent
nager
│   ├──ction
│   ├── stt_pipeline.py ine
│   └── summarizeration

├── .env.example
└── README.md
```

## Testing

```bash
# Ru tests
pytts/
```

cture

- **FastAPI**: Modern async web framework
- **WebSockets**: Real-taming
ion
- **Google Cloud**: Speech-to-
- **Google Gemini**: SO
