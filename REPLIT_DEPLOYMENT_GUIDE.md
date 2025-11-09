# Complete Replit Deployment Guide for Arogya-AI

## Overview
This guide will help you deploy the full-stack Arogya-AI application (Next.js frontend + FastAPI backend) on Replit with all features working including live captions, video calls, and database integration.

## Prerequisites
- Replit account
- Google Cloud service account (for STT/Translation)
- Supabase account (for database)
- OpenAI API key (optional, for Whisper fallback)

## Step 1: Create Replit Project

### Option A: Import from GitHub
1. Go to [replit.com](https://replit.com)
2. Click "Create Repl"
3. Select "Import from GitHub"
4. Enter your repository URL
5. Choose "Node.js" as the template

### Option B: Upload Files
1. Create a new "Node.js" Repl
2. Upload all your project files
3. Ensure the folder structure is maintained

## Step 2: Configure Replit Files

### Create `.replit` Configuration
```toml
# .replit
modules = ["nodejs-20", "python-3.11"]

[nix]
channel = "stable-24_05"

[[ports]]
localPort = 3000
externalPort = 80

[[ports]]
localPort = 8000
externalPort = 8080

[deployment]
run = ["sh", "-c", "npm run build && npm start"]
deploymentTarget = "cloudrun"

[env]
PATH = "/home/runner/$REPL_SLUG/.config/npm/node_global/bin:/home/runner/$REPL_SLUG/node_modules/.bin"
npm_config_prefix = "/home/runner/$REPL_SLUG/.config/npm/node_global"
```

### Create `replit.nix` for Dependencies
```nix
# replit.nix
{ pkgs }: {
  deps = [
    pkgs.nodejs_20
    pkgs.python311
    pkgs.python311Packages.pip
    pkgs.ffmpeg
    pkgs.portaudio
    pkgs.pkg-config
  ];
}
```

### Create Startup Script
```bash
#!/bin/bash
# run.sh

echo "🚀 Starting Arogya-AI Application..."

# Install Python dependencies
echo "📦 Installing Python dependencies..."
cd backend
pip install -r requirements.txt
cd ..

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Start backend in background
echo "🔧 Starting FastAPI backend..."
cd backend
python run.py &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 10

# Start frontend
echo "🌐 Starting Next.js frontend..."
npm run dev &
FRONTEND_PID=$!

# Keep both processes running
wait $BACKEND_PID $FRONTEND_PID
```

Make it executable:
```bash
chmod +x run.sh
```

## Step 3: Environment Variables

### Frontend Environment (.env.local)
```env
# .env.local
NEXT_PUBLIC_BACKEND_URL=https://your-repl-name.your-username.repl.co:8080
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Backend Environment (.env)
```env
# backend/.env
# Database
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_role_key

# Google Cloud (for STT and Translation)
GOOGLE_APPLICATION_CREDENTIALS=/home/runner/your-repl-name/backend/google-credentials.json

# OpenAI (optional, for Whisper fallback)
OPENAI_API_KEY=your_openai_api_key

# FastAPI
HOST=0.0.0.0
PORT=8000
```

### Set Replit Secrets
In Replit, go to "Secrets" tab and add:
- `SUPABASE_URL`
- `SUPABASE_KEY`
- `SUPABASE_ANON_KEY`
- `OPENAI_API_KEY`
- `GOOGLE_CREDENTIALS_JSON` (paste the entire JSON content)

## Step 4: Google Cloud Setup

### Create Service Account
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable APIs:
   - Speech-to-Text API
   - Translation API
   - Generative AI API (for alerts)
4. Create service account with these roles:
   - Speech Client
   - Translation Client
   - Generative AI User

### Download Credentials
1. Generate JSON key for service account
2. Copy the JSON content
3. In Replit Secrets, add `GOOGLE_CREDENTIALS_JSON` with the full JSON

### Create Credentials File Script
```python
# backend/setup_credentials.py
import os
import json

def setup_google_credentials():
    """Create Google credentials file from environment variable"""
    credentials_json = os.getenv('GOOGLE_CREDENTIALS_JSON')
    if credentials_json:
        credentials_path = '/home/runner/' + os.getenv('REPL_SLUG', 'arogya-ai') + '/backend/google-credentials.json'
        with open(credentials_path, 'w') as f:
            f.write(credentials_json)
        os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = credentials_path
        print(f"✅ Google credentials set up at {credentials_path}")
    else:
        print("❌ GOOGLE_CREDENTIALS_JSON not found in environment")

if __name__ == "__main__":
    setup_google_credentials()
```

## Step 5: Update Package.json

```json
{
  "name": "arogya-ai",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start -p 3000",
    "lint": "next lint",
    "setup": "cd backend && python setup_credentials.py && cd ..",
    "backend": "cd backend && python run.py",
    "full-start": "./run.sh"
  },
  "dependencies": {
    // ... your existing dependencies
  }
}
```

## Step 6: Update Backend for Replit

### Modify backend/run.py
```python
# backend/run.py
import os
import uvicorn
from setup_credentials import setup_google_credentials

if __name__ == "__main__":
    # Setup Google credentials from environment
    setup_google_credentials()
    
    # Get port from environment or default to 8000
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    
    print(f"🚀 Starting FastAPI server on {host}:{port}")
    
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=False,  # Disable reload in production
        log_level="info"
    )
```

### Update CORS Settings
```python
# backend/app/main.py
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Arogya-AI Backend")

# Update CORS for Replit
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://*.repl.co",
        "https://*.replit.dev",
        "https://*.replit.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Step 7: Frontend Configuration Updates

### Update next.config.js
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000',
  },
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL}/:path*`,
      },
    ]
  },
  // Enable WebSocket support
  experimental: {
    serverComponentsExternalPackages: ['ws'],
  },
}

module.exports = nextConfig
```

## Step 8: Database Setup (Supabase)

### Create Tables
Run these SQL commands in Supabase SQL editor:

```sql
-- Users table
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    name VARCHAR NOT NULL,
    role VARCHAR CHECK (role IN ('doctor', 'patient')) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Consultations table
CREATE TABLE consultations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    doctor_id UUID REFERENCES users(id),
    patient_id UUID REFERENCES users(id),
    status VARCHAR DEFAULT 'scheduled',
    transcript TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Community lexicon table
CREATE TABLE community_lexicon (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    regional_term VARCHAR NOT NULL,
    english_equivalent VARCHAR NOT NULL,
    language VARCHAR NOT NULL,
    embedding VECTOR(384),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_lexicon ENABLE ROW LEVEL SECURITY;
```

## Step 9: Deployment Steps

### 1. Upload Files to Replit
- Upload all project files maintaining folder structure
- Ensure `run.sh` is in root directory
- Backend files in `backend/` folder
- Frontend files in root

### 2. Set Environment Variables
- Go to Replit Secrets tab
- Add all required environment variables
- Ensure `GOOGLE_CREDENTIALS_JSON` contains full JSON

### 3. Install Dependencies
```bash
# In Replit Shell
npm install
cd backend
pip install -r requirements.txt
cd ..
```

### 4. Test Locally in Replit
```bash
# Run the full application
./run.sh
```

### 5. Configure Ports
- Frontend: Port 3000 (mapped to 80)
- Backend: Port 8000 (mapped to 8080)
- Update `NEXT_PUBLIC_BACKEND_URL` to use port 8080

## Step 10: Production Deployment

### Deploy to Replit Hosting
1. Click "Deploy" in Replit
2. Choose "Autoscale" deployment
3. Set build command: `npm run build`
4. Set run command: `npm start`
5. Configure custom domain if needed

### Environment Variables for Production
Update `.env.local` with production URLs:
```env
NEXT_PUBLIC_BACKEND_URL=https://your-app-name.replit.app:8080
```

## Step 11: Testing Checklist

### ✅ Basic Functionality
- [ ] Frontend loads without errors
- [ ] Backend API responds at `/health`
- [ ] Database connection works
- [ ] User authentication works

### ✅ Video Call Features
- [ ] WebRTC connection establishes
- [ ] Camera and microphone access
- [ ] Video/audio streaming works
- [ ] Screen sharing (if implemented)

### ✅ Live Captions
- [ ] WebSocket connection to `/ws/captions/`
- [ ] Audio capture from microphone
- [ ] Speech-to-text transcription
- [ ] Translation between languages
- [ ] Real-time caption display

### ✅ Additional Features
- [ ] Appointment scheduling
- [ ] Lab report analysis
- [ ] Alert system
- [ ] Community lexicon

## Troubleshooting

### Common Issues

#### 1. Google Cloud Credentials
```bash
# Check if credentials file exists
ls -la backend/google-credentials.json

# Test credentials
cd backend
python -c "from app.stt_pipeline import validate_stt_configuration; print(validate_stt_configuration())"
```

#### 2. WebSocket Connection Issues
- Ensure backend is running on port 8000
- Check CORS settings allow Replit domains
- Verify WebSocket URL uses correct port (8080 for external)

#### 3. Audio/Video Issues
- Check browser permissions for microphone/camera
- Ensure HTTPS is used (required for WebRTC)
- Test with different browsers

#### 4. Database Connection
```bash
# Test Supabase connection
cd backend
python -c "from app.database import DatabaseClient; db = DatabaseClient(); print('Database connected!')"
```

## Performance Optimization

### 1. Enable Caching
```javascript
// next.config.js
const nextConfig = {
  // ... existing config
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
}
```

### 2. Optimize Images
```javascript
// next.config.js
const nextConfig = {
  // ... existing config
  images: {
    domains: ['your-domain.com'],
    formats: ['image/webp', 'image/avif'],
  },
}
```

### 3. Backend Optimization
```python
# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.gzip import GZipMiddleware

app = FastAPI()
app.add_middleware(GZipMiddleware, minimum_size=1000)
```

## Security Considerations

### 1. Environment Variables
- Never commit `.env` files
- Use Replit Secrets for sensitive data
- Rotate API keys regularly

### 2. CORS Configuration
- Restrict origins to your domains only
- Don't use wildcard (*) in production

### 3. Database Security
- Enable Row Level Security (RLS)
- Use service role key only in backend
- Validate all user inputs

## Monitoring and Logs

### 1. Backend Logs
```python
# backend/app/main.py
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
```

### 2. Frontend Error Tracking
```javascript
// pages/_app.js
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});
```

## Support and Resources

- [Replit Documentation](https://docs.replit.com)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [Supabase Documentation](https://supabase.com/docs)
- [Google Cloud STT](https://cloud.google.com/speech-to-text/docs)

This comprehensive guide should help you deploy your Arogya-AI application to Replit with all features working properly. Follow each step carefully and test thoroughly before going to production.