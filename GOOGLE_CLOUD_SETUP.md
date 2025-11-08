# Google Cloud Speech-to-Text Setup Guide

## Step-by-Step Instructions to Get GOOGLE_APPLICATION_CREDENTIALS

### Step 1: Create a Google Cloud Account
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Accept terms of service if prompted
4. You'll get **$300 free credits** for 90 days (no credit card required initially)

### Step 2: Create a New Project
1. Click on the project dropdown at the top (next to "Google Cloud")
2. Click **"New Project"**
3. Enter project name: `arogya-ai-telehealth` (or any name you prefer)
4. Click **"Create"**
5. Wait for the project to be created (takes a few seconds)
6. Select your new project from the dropdown

### Step 3: Enable Speech-to-Text API
1. In the search bar at the top, type: **"Speech-to-Text API"**
2. Click on **"Cloud Speech-to-Text API"**
3. Click the **"Enable"** button
4. Wait for the API to be enabled (takes 10-30 seconds)

### Step 4: Create a Service Account
1. In the left sidebar, go to **"IAM & Admin"** → **"Service Accounts"**
   - Or search for "Service Accounts" in the top search bar
2. Click **"+ CREATE SERVICE ACCOUNT"** at the top
3. Fill in the details:
   - **Service account name**: `arogya-speech-service`
   - **Service account ID**: (auto-generated, leave as is)
   - **Description**: `Service account for Speech-to-Text API`
4. Click **"CREATE AND CONTINUE"**

### Step 5: Grant Permissions
1. In the "Grant this service account access to project" section:
   - Click the **"Select a role"** dropdown
   - Search for: **"Cloud Speech Client"**
   - Select **"Cloud Speech Client"**
   - Click **"+ ADD ANOTHER ROLE"**
   - Search for: **"Cloud Speech Administrator"** (optional, for full access)
   - Select it
2. Click **"CONTINUE"**
3. Click **"DONE"** (skip the optional "Grant users access" section)

### Step 6: Create and Download JSON Key
1. You'll see your service account in the list
2. Click on the **email address** of your service account (e.g., `arogya-speech-service@...`)
3. Go to the **"KEYS"** tab
4. Click **"ADD KEY"** → **"Create new key"**
5. Select **"JSON"** format
6. Click **"CREATE"**
7. A JSON file will automatically download to your computer
   - File name will be something like: `arogya-ai-telehealth-abc123def456.json`
   - **IMPORTANT**: Keep this file secure! It contains credentials.

### Step 7: Move the JSON File to Your Project
1. Rename the downloaded file to something simple: `google-credentials.json`
2. Move it to your backend directory:
   ```
   Vibeathon/backend/google-credentials.json
   ```
3. **IMPORTANT**: Add it to `.gitignore` to prevent committing credentials:
   ```bash
   # Add this line to backend/.gitignore
   google-credentials.json
   ```

### Step 8: Set Environment Variable

#### Option A: In `.env` file (Recommended for Development)
Add this line to `backend/.env`:
```bash
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
```

Or use absolute path:
```bash
GOOGLE_APPLICATION_CREDENTIALS=C:/Users/HP/Desktop/Vibethon-project/Vibeathon/backend/google-credentials.json
```

#### Option B: System Environment Variable (Windows)
1. Open **System Properties** → **Environment Variables**
2. Under "User variables", click **"New"**
3. Variable name: `GOOGLE_APPLICATION_CREDENTIALS`
4. Variable value: Full path to your JSON file
   ```
   C:\Users\HP\Desktop\Vibethon-project\Vibeathon\backend\google-credentials.json
   ```
5. Click **OK** and restart your terminal/IDE

### Step 9: Verify Setup
Test if credentials work by running this Python script:

```python
# test_google_credentials.py
from google.cloud import speech_v1p1beta1 as speech
import os

try:
    # This will use GOOGLE_APPLICATION_CREDENTIALS automatically
    client = speech.SpeechClient()
    print("✅ Google Cloud credentials are working!")
    print(f"Credentials file: {os.getenv('GOOGLE_APPLICATION_CREDENTIALS')}")
except Exception as e:
    print(f"❌ Error: {e}")
```

Run it:
```bash
cd backend
python test_google_credentials.py
```

## Alternative: Use Gemini API Only (Simpler Setup)

If you want to avoid Google Cloud setup complexity, you can modify the voice intake to use **only Gemini API** for both transcription and extraction:

### Get Gemini API Key (Much Simpler):
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click **"Create API Key"**
3. Copy the key
4. Add to `backend/.env`:
   ```bash
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

### Modify voice_intake.py to use Gemini for transcription:
I can help you modify the code to use Gemini's audio understanding capabilities instead of Speech-to-Text API if you prefer this simpler approach.

## Pricing Information

### Google Cloud Speech-to-Text:
- **Free tier**: 60 minutes per month
- **After free tier**: $0.006 per 15 seconds (~$1.44 per hour)
- **Medical model**: $0.009 per 15 seconds (~$2.16 per hour)

### Gemini API:
- **Free tier**: 15 requests per minute, 1500 per day
- **Paid tier**: Very affordable, pay-as-you-go

## Troubleshooting

### Error: "Could not automatically determine credentials"
- Ensure `GOOGLE_APPLICATION_CREDENTIALS` is set correctly
- Check the JSON file path is correct
- Restart your terminal/IDE after setting environment variable

### Error: "Permission denied"
- Make sure you granted "Cloud Speech Client" role to the service account
- Wait a few minutes for permissions to propagate

### Error: "API not enabled"
- Go back to Google Cloud Console
- Search for "Speech-to-Text API"
- Make sure it's enabled for your project

### Error: "Quota exceeded"
- You've used up the free 60 minutes
- Either wait for next month or enable billing
- Consider using Gemini API as alternative

## Security Best Practices

1. **Never commit credentials to Git**:
   ```bash
   # Add to .gitignore
   google-credentials.json
   *.json
   !package.json
   ```

2. **Use environment variables** instead of hardcoding paths

3. **Rotate keys periodically**:
   - Delete old keys from Google Cloud Console
   - Create new keys every few months

4. **Restrict permissions**:
   - Only grant "Cloud Speech Client" role
   - Don't use "Owner" or "Editor" roles

5. **For production**:
   - Use Google Cloud Secret Manager
   - Use Workload Identity (for GKE/Cloud Run)
   - Never expose credentials in frontend

## Quick Start Commands

```bash
# 1. Install required package
pip install google-cloud-speech

# 2. Set environment variable (Windows CMD)
set GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\google-credentials.json

# 3. Set environment variable (Windows PowerShell)
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\google-credentials.json"

# 4. Set environment variable (Linux/Mac)
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/google-credentials.json"

# 5. Test it
python test_google_credentials.py
```

## Need Help?

If you encounter any issues:
1. Check the [Google Cloud Speech-to-Text Documentation](https://cloud.google.com/speech-to-text/docs)
2. Verify your project has billing enabled (for usage beyond free tier)
3. Check the [Troubleshooting Guide](https://cloud.google.com/speech-to-text/docs/troubleshooting)

## Summary

**Easiest Path:**
1. Create Google Cloud account → Get $300 free credits
2. Create project → Enable Speech-to-Text API
3. Create service account → Download JSON key
4. Move JSON to `backend/google-credentials.json`
5. Add to `.env`: `GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json`
6. Done! 🎉

**Total time**: ~10 minutes
**Cost**: Free (60 minutes/month, then $1-2 per hour)
