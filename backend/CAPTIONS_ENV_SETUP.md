# Live Captions Environment Setup Guide

## Overview

The live captions feature requires specific environment variables to be configured for speech-to-text (STT) and translation services. This guide covers all required and optional environment variables for the caption system.

---

## Required Environment Variables

### 1. Google Cloud Credentials (Required)

The caption system uses Google Cloud Speech-to-Text and Translation APIs as the primary services.

#### `GOOGLE_APPLICATION_CREDENTIALS`

**Purpose**: Path to your Google Cloud service account JSON credentials file.

**Required for**:
- Google Cloud Speech-to-Text (primary ASR)
- Google Cloud Translation API

**How to get it**:

1. **Create a Google Cloud Project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Note your Project ID

2. **Enable Required APIs**:
   - Go to "APIs & Services" → "Library"
   - Search for and enable:
     - **Cloud Speech-to-Text API**
     - **Cloud Translation API**

3. **Create Service Account**:
   - Go to "IAM & Admin" → "Service Accounts"
   - Click "Create Service Account"
   - Name: `arogya-ai-captions` (or any name)
   - Grant roles:
     - **Cloud Speech Client**
     - **Cloud Translation API User**
   - Click "Done"

4. **Download Credentials**:
   - Click on the service account you just created
   - Go to "Keys" tab
   - Click "Add Key" → "Create new key"
   - Choose "JSON" format
   - Download the file (e.g., `google-credentials.json`)

5. **Configure Environment Variable**:
   ```bash
   # In backend/.env
   GOOGLE_APPLICATION_CREDENTIALS=/path/to/google-credentials.json
   ```

   **Example**:
   ```bash
   # Absolute path (recommended)
   GOOGLE_APPLICATION_CREDENTIALS=/home/user/arogya-ai/backend/google-credentials.json
   
   # Or relative path from backend directory
   GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
   ```

**Verification**:
```bash
# Check if file exists
ls -la $GOOGLE_APPLICATION_CREDENTIALS

# Check if it's valid JSON
cat $GOOGLE_APPLICATION_CREDENTIALS | python -m json.tool
```

---

## Optional Environment Variables

### 2. OpenAI API Key (Optional - Fallback ASR)

The caption system can use OpenAI Whisper API as a fallback if Google Cloud STT fails or is unavailable.

#### `OPENAI_API_KEY`

**Purpose**: API key for OpenAI Whisper API (fallback speech-to-text service).

**Required for**:
- OpenAI Whisper API (fallback ASR when Google Cloud STT fails)

**How to get it**:

1. **Create OpenAI Account**:
   - Go to [OpenAI Platform](https://platform.openai.com/)
   - Sign up or log in

2. **Generate API Key**:
   - Go to [API Keys](https://platform.openai.com/api-keys)
   - Click "Create new secret key"
   - Name it (e.g., "Arogya-AI Captions")
   - Copy the key (you won't be able to see it again!)

3. **Configure Environment Variable**:
   ```bash
   # In backend/.env
   OPENAI_API_KEY=sk-proj-...your_key_here
   ```

**Note**: This is optional. If not configured, the system will only use Google Cloud STT. However, having a fallback improves reliability.

---

## Database Configuration (Optional)

### 3. Database Connection (Optional - For Transcript Storage)

The caption system can optionally store transcripts in a database.

#### `DATABASE_URL`

**Purpose**: PostgreSQL database connection string for storing consultation transcripts.

**Format**:
```bash
DATABASE_URL=postgresql://user:password@host:port/database
```

**Example with Supabase**:
```bash
DATABASE_URL=postgresql://postgres:your_password@db.your_project.supabase.co:5432/postgres
```

**Note**: This is optional. If not configured, captions will still work but won't be saved to the database.

---

## Complete `.env` File Example

Here's a complete example of the `backend/.env` file with all caption-related variables:

```bash
# ============================================
# LIVE CAPTIONS CONFIGURATION
# ============================================

# Google Cloud Credentials (REQUIRED)
# Path to your Google Cloud service account JSON file
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json

# OpenAI API Key (OPTIONAL - Fallback ASR)
# Used when Google Cloud STT fails or is unavailable
OPENAI_API_KEY=sk-proj-...your_key_here

# Database Connection (OPTIONAL - For transcript storage)
# PostgreSQL connection string
DATABASE_URL=postgresql://postgres:password@localhost:5432/arogya_ai

# ============================================
# OTHER BACKEND CONFIGURATION
# ============================================

# Supabase Configuration (for other features)
SUPABASE_URL=https://your_project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key_here

# Google Gemini API (for SOAP notes)
GEMINI_API_KEY=AIzaSy...your_key_here
```

---

## API Quota Limits

Understanding API quotas helps you plan usage and avoid service interruptions.

### Google Cloud Speech-to-Text

**Free Tier** (per month):
- **60 minutes** of audio processing
- Applies to standard model
- Enhanced models may have different limits

**Pricing** (after free tier):
- Standard model: $0.006 per 15 seconds
- Enhanced model: $0.009 per 15 seconds
- Data logging discount: -50% if you opt-in

**Quota Management**:
- Monitor usage in [Google Cloud Console](https://console.cloud.google.com/apis/api/speech.googleapis.com/quotas)
- Set up billing alerts to avoid surprises
- Consider upgrading to paid tier for production use

**Estimated Usage**:
- 1-hour consultation = 60 minutes of audio
- 10 consultations/day = 600 minutes/day = 18,000 minutes/month
- Free tier covers ~1 consultation per month
- Paid tier cost: ~$216/month for 10 consultations/day

### Google Cloud Translation

**Free Tier** (per month):
- **500,000 characters** of translation
- Applies to Translation API v2

**Pricing** (after free tier):
- $20 per 1 million characters

**Quota Management**:
- Monitor usage in [Google Cloud Console](https://console.cloud.google.com/apis/api/translate.googleapis.com/quotas)
- Average caption: ~50 characters
- 500,000 characters = ~10,000 captions
- Typical consultation: ~100-200 captions
- Free tier covers ~50-100 consultations/month

### OpenAI Whisper API

**Pricing**:
- $0.006 per minute of audio
- No free tier

**Quota Management**:
- Monitor usage in [OpenAI Dashboard](https://platform.openai.com/usage)
- Set spending limits in account settings
- Only used as fallback (minimal usage expected)

**Estimated Usage**:
- Only used when Google Cloud STT fails
- Typical fallback rate: <5% of requests
- 1-hour consultation fallback: ~3 minutes = $0.018
- Minimal cost impact

---

## Setup Instructions for New Developers

Follow these steps to set up the caption system on a new development machine:

### Step 1: Clone Repository

```bash
git clone https://github.com/your-org/arogya-ai.git
cd arogya-ai/backend
```

### Step 2: Create Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # On macOS/Linux
# or
venv\Scripts\activate  # On Windows
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 4: Set Up Google Cloud Credentials

1. **Download credentials** (see "Required Environment Variables" section above)
2. **Place file in backend directory**:
   ```bash
   # Copy your downloaded credentials file
   cp ~/Downloads/google-credentials.json ./google-credentials.json
   ```

3. **Verify file permissions** (Linux/macOS):
   ```bash
   chmod 600 google-credentials.json
   ```

### Step 5: Create `.env` File

```bash
# Copy example file
cp .env.example .env

# Edit with your credentials
nano .env  # or use your preferred editor
```

Add the following:
```bash
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
OPENAI_API_KEY=sk-proj-...your_key_here  # Optional
```

### Step 6: Verify Setup

```bash
# Run verification script
python -c "
from app.stt_pipeline import validate_stt_configuration
import json

result = validate_stt_configuration()
print(json.dumps(result, indent=2))
"
```

**Expected output**:
```json
{
  "google_cloud_available": true,
  "google_credentials_valid": true,
  "google_speech_client": true,
  "google_translate_client": true,
  "openai_available": true,
  "openai_client": true,
  "warnings": [],
  "errors": []
}
```

### Step 7: Start Backend Server

```bash
# Start server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Check logs for**:
```
✅ Google Cloud credentials verified successfully
✅ Google Cloud Speech-to-Text initialized (primary ASR)
✅ Google Cloud Translation initialized
```

### Step 8: Test Caption System

1. **Start frontend** (in another terminal):
   ```bash
   cd ../frontend
   npm run dev
   ```

2. **Open browser**: http://localhost:3000

3. **Start a video call** and enable captions

4. **Speak into microphone** and verify captions appear

---

## Troubleshooting

### Error: "GOOGLE_APPLICATION_CREDENTIALS environment variable not set"

**Cause**: Environment variable not configured.

**Solution**:
```bash
# Check if variable is set
echo $GOOGLE_APPLICATION_CREDENTIALS

# If empty, add to .env file
echo 'GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json' >> .env

# Restart backend server
```

### Error: "Google Cloud credentials file not found"

**Cause**: File path is incorrect or file doesn't exist.

**Solution**:
```bash
# Check if file exists
ls -la ./google-credentials.json

# If not found, check the path in .env
cat .env | grep GOOGLE_APPLICATION_CREDENTIALS

# Use absolute path if relative path doesn't work
GOOGLE_APPLICATION_CREDENTIALS=/full/path/to/google-credentials.json
```

### Error: "Credentials file is not valid JSON"

**Cause**: Credentials file is corrupted or incomplete.

**Solution**:
```bash
# Validate JSON
cat google-credentials.json | python -m json.tool

# If invalid, re-download from Google Cloud Console
```

### Error: "Google Cloud credentials file is missing required fields"

**Cause**: Downloaded wrong type of credentials or file is incomplete.

**Solution**:
- Ensure you downloaded a **service account key** (not OAuth credentials)
- Re-download from Google Cloud Console
- Check file contains: `type`, `project_id`, `private_key`, `client_email`

### Error: "Google Cloud STT API error: 403 Forbidden"

**Cause**: API not enabled or insufficient permissions.

**Solution**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable **Cloud Speech-to-Text API**
3. Verify service account has **Cloud Speech Client** role
4. Wait a few minutes for permissions to propagate

### Error: "OpenAI API key invalid or not set"

**Cause**: OpenAI API key is incorrect or missing.

**Solution**:
```bash
# Check if key is set
cat .env | grep OPENAI_API_KEY

# Verify key format (should start with sk-proj- or sk-)
# If invalid, generate new key from OpenAI Platform

# Note: This is optional - system will work without it
```

### Warning: "Whisper fallback not available (OPENAI_API_KEY not set)"

**Cause**: OpenAI API key not configured.

**Solution**:
- This is a warning, not an error
- System will work with Google Cloud STT only
- To enable fallback, add `OPENAI_API_KEY` to `.env`
- Not required for basic functionality

### Error: "API quota exceeded"

**Cause**: Exceeded free tier limits for Google Cloud APIs.

**Solution**:
1. Check usage in [Google Cloud Console](https://console.cloud.google.com/apis/dashboard)
2. Options:
   - Wait for quota to reset (monthly)
   - Enable billing and upgrade to paid tier
   - Reduce usage (fewer/shorter consultations)
3. Set up billing alerts to avoid future issues

### Error: "FFmpeg not found - cannot convert audio"

**Cause**: FFmpeg not installed (required for audio format conversion).

**Solution**:

**On macOS**:
```bash
brew install ffmpeg
```

**On Ubuntu/Debian**:
```bash
sudo apt-get update
sudo apt-get install ffmpeg
```

**On Windows**:
1. Download from [FFmpeg website](https://ffmpeg.org/download.html)
2. Extract to `C:\ffmpeg`
3. Add `C:\ffmpeg\bin` to PATH
4. Restart terminal

**Verify installation**:
```bash
ffmpeg -version
```

---

## Security Best Practices

### 1. Protect Credentials Files

```bash
# Set restrictive permissions (Linux/macOS)
chmod 600 google-credentials.json
chmod 600 .env

# Never commit to git
echo "google-credentials.json" >> .gitignore
echo ".env" >> .gitignore
```

### 2. Use Environment-Specific Credentials

```bash
# Development
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials-dev.json

# Production
GOOGLE_APPLICATION_CREDENTIALS=/etc/secrets/google-credentials-prod.json
```

### 3. Rotate API Keys Regularly

- Rotate Google Cloud service account keys every 90 days
- Rotate OpenAI API keys every 6 months
- Use separate keys for development and production

### 4. Monitor API Usage

- Set up billing alerts in Google Cloud Console
- Monitor usage dashboards regularly
- Set spending limits in OpenAI account

### 5. Principle of Least Privilege

- Grant only required permissions to service accounts
- Use separate service accounts for different environments
- Regularly audit service account permissions

---

## Production Deployment Checklist

Before deploying to production, ensure:

- [ ] Google Cloud credentials configured with production service account
- [ ] API quotas sufficient for expected load
- [ ] Billing enabled and alerts configured
- [ ] FFmpeg installed on production server
- [ ] Environment variables set in production environment
- [ ] Credentials files have restrictive permissions (600)
- [ ] Separate credentials for production (not dev credentials)
- [ ] Monitoring and logging configured
- [ ] Backup ASR service (OpenAI Whisper) configured
- [ ] Database connection configured for transcript storage
- [ ] SSL/TLS enabled for WebSocket connections
- [ ] Rate limiting configured to prevent abuse
- [ ] Error tracking (e.g., Sentry) configured

---

## Additional Resources

### Documentation

- [Google Cloud Speech-to-Text Documentation](https://cloud.google.com/speech-to-text/docs)
- [Google Cloud Translation Documentation](https://cloud.google.com/translate/docs)
- [OpenAI Whisper API Documentation](https://platform.openai.com/docs/guides/speech-to-text)
- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)

### Support

- Google Cloud Support: https://cloud.google.com/support
- OpenAI Support: https://help.openai.com/
- Project Issues: https://github.com/your-org/arogya-ai/issues

### Monitoring

- Google Cloud Console: https://console.cloud.google.com/
- OpenAI Usage Dashboard: https://platform.openai.com/usage
- API Quotas: https://console.cloud.google.com/apis/dashboard

---

## Summary

**Minimum Required Setup**:
1. Google Cloud credentials file
2. `GOOGLE_APPLICATION_CREDENTIALS` environment variable
3. FFmpeg installed

**Recommended Setup**:
1. All of the above
2. `OPENAI_API_KEY` for fallback ASR
3. `DATABASE_URL` for transcript storage
4. Billing enabled for production use

**Next Steps**:
1. Follow setup instructions above
2. Verify configuration with validation script
3. Test caption system in development
4. Monitor API usage and costs
5. Deploy to production with production credentials

---

**For questions or issues, please refer to the troubleshooting section or create an issue on GitHub.**
