# Replit Hackathon Deployment Guide - Video Calls Working

## Overview
Complete guide to deploy Arogya-AI on Replit with working video calls, live captions, and all features for hackathon submission.

## Step 1: Replit Project Setup

### 1.1 Create New Repl
1. Go to [replit.com](https://replit.com)
2. Click "Create Repl"
3. Choose "Node.js" template
4. Name it "arogya-ai-hackathon"

### 1.2 Upload Project Files
Upload your entire project maintaining this structure:
```
arogya-ai-hackathon/
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── styles/
│   └── ...
├── backend/
│   ├── app/
│   ├── requirements.txt
│   └── ...
├── package.json
├── .replit
├── replit.nix
└── run.sh
```

## Step 2: Replit Configuration Files

### 2.1 Update .replit Configuration
```toml
# .replit
modules = ["nodejs-20", "python-3.11"]

[nix]
channel = "stable-24_05"

[[ports]]
localPort = 3000
externalPort = 80
exposeLocalhost = true

[[ports]]
localPort = 8000
externalPort = 8080
exposeLocalhost = true

[deployment]
run = ["sh", "-c", "./run.sh"]
deploymentTarget = "cloudrun"
publicDir = "/"

[env]
PATH = "/home/runner/$REPL_SLUG/.config/npm/node_global/bin:/home/runner/$REPL_SLUG/node_modules/.bin"
npm_config_prefix = "/home/runner/$REPL_SLUG/.config/npm/node_global"

[gitHubImport]
requiredFiles = [".replit", "replit.nix"]

[languages]

[languages.javascript]
pattern = "**/{*.js,*.jsx,*.ts,*.tsx,*.json}"

[languages.javascript.languageServer]
start = "typescript-language-server --stdio"

[languages.python]
pattern = "**/*.py"

[languages.python.languageServer]
start = "pylsp"
```

### 2.2 Update replit.nix for Dependencies
```nix
# replit.nix
{ pkgs }: {
  deps = [
    pkgs.nodejs_20
    pkgs.python311
    pkgs.python311Packages.pip
    pkgs.python311Packages.setuptools
    pkgs.python311Packages.wheel
    pkgs.ffmpeg
    pkgs.portaudio
    pkgs.pkg-config
    pkgs.gcc
    pkgs.alsa-lib
    pkgs.pulseaudio
    pkgs.libasound2-dev
    pkgs.libsndfile
    pkgs.curl
    pkgs.wget
  ];
  
  env = {
    PYTHON_LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath [
      pkgs.stdenv.cc.cc.lib
      pkgs.zlib
      pkgs.glib
      pkgs.alsa-lib
      pkgs.libsndfile
    ];
    PYTHONHOME = "${pkgs.python311}";
    PYTHONPATH = "${pkgs.python311}/lib/python3.11/site-packages";
  };
}
##
# 2.3 Create Optimized Startup Script
```bash
#!/bin/bash
# run.sh - Optimized for Replit

echo "🚀 Starting Arogya-AI for Replit Hackathon..."

# Set environment variables
export PYTHONPATH="/home/runner/$REPL_SLUG/backend:$PYTHONPATH"
export NODE_ENV=production

# Setup Google credentials if available
echo "🔑 Setting up credentials..."
cd backend
if [ -f "setup_credentials.py" ]; then
    python setup_credentials.py
fi
cd ..

# Install Python dependencies with cache
echo "📦 Installing Python dependencies..."
cd backend
if [ ! -f ".deps_installed" ]; then
    pip install --user -r requirements.txt
    touch .deps_installed
    echo "✅ Python dependencies installed"
else
    echo "✅ Python dependencies already installed"
fi
cd ..

# Install Node.js dependencies with cache
echo "📦 Installing Node.js dependencies..."
if [ ! -d "node_modules" ] || [ ! -f ".node_deps_installed" ]; then
    npm install --production
    touch .node_deps_installed
    echo "✅ Node.js dependencies installed"
else
    echo "✅ Node.js dependencies already installed"
fi

# Build frontend for production
echo "🏗️ Building frontend..."
if [ ! -d ".next" ] || [ ! -f ".frontend_built" ]; then
    npm run build
    touch .frontend_built
    echo "✅ Frontend built"
else
    echo "✅ Frontend already built"
fi

# Start backend
echo "🔧 Starting FastAPI backend..."
cd backend
python replit_run.py &
BACKEND_PID=$!
cd ..

# Wait for backend to be ready
echo "⏳ Waiting for backend to start..."
for i in {1..30}; do
    if curl -f http://localhost:8000/health > /dev/null 2>&1; then
        echo "✅ Backend is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Backend failed to start in 30 seconds"
        exit 1
    fi
    sleep 1
done

# Start frontend
echo "🌐 Starting Next.js frontend..."
npm start &
FRONTEND_PID=$!

echo ""
echo "🎉 Arogya-AI is running!"
echo "📱 Frontend: https://$REPL_SLUG.$REPL_OWNER.repl.co"
echo "🔧 Backend: https://$REPL_SLUG.$REPL_OWNER.repl.co:8080"
echo "📚 API Docs: https://$REPL_SLUG.$REPL_OWNER.repl.co:8080/docs"
echo ""
echo "For video calls to work:"
echo "1. Click 'Open in new tab' for HTTPS"
echo "2. Allow camera/microphone permissions"
echo "3. Use the Replit domain (not preview)"
echo ""

# Keep processes running
wait $BACKEND_PID $FRONTEND_PID
```

## Step 3: Backend Configuration for Replit

### 3.1 Create Replit-Specific Backend Runner
```python
# backend/replit_run.py
"""
Replit-optimized FastAPI server
"""
import os
import sys
import uvicorn
import logging
from pathlib import Path

# Add backend to Python path
backend_path = Path(__file__).parent
sys.path.insert(0, str(backend_path))

def setup_logging():
    """Setup logging for Replit"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[logging.StreamHandler()]
    )

def setup_credentials():
    """Setup Google Cloud credentials from Replit secrets"""
    try:
        from setup_credentials import setup_google_credentials
        setup_google_credentials()
        print("✅ Google Cloud credentials configured")
    except Exception as e:
        print(f"⚠️ Google Cloud credentials not configured: {e}")
        print("   Add GOOGLE_CREDENTIALS_JSON to Replit Secrets for STT features")

def main():
    """Main entry point for Replit"""
    print("🚀 Starting Arogya-AI Backend on Replit...")
    
    setup_logging()
    setup_credentials()
    
    # Replit configuration
    host = "0.0.0.0"
    port = int(os.getenv("PORT", 8000))
    
    print(f"🌐 Backend starting on {host}:{port}")
    print(f"📚 API docs: http://{host}:{port}/docs")
    
    # Start server with Replit-optimized settings
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=False,
        log_level="info",
        access_log=True,
        workers=1,
        timeout_keep_alive=30,
        timeout_graceful_shutdown=10
    )

if __name__ == "__main__":
    main()
```

### 3.2 Update Backend CORS for Replit
```python
# backend/app/main.py
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Arogya-AI Backend",
    description="Healthcare AI Platform with Live Captions",
    version="1.0.0"
)

# Replit CORS configuration
repl_slug = os.getenv("REPL_SLUG", "arogya-ai")
repl_owner = os.getenv("REPL_OWNER", "username")

allowed_origins = [
    "http://localhost:3000",
    "http://localhost:8000",
    f"https://{repl_slug}.{repl_owner}.repl.co",
    f"https://{repl_slug}--{repl_owner}.repl.co",
    f"http://{repl_slug}.{repl_owner}.repl.co",
    "*.repl.co",
    "*.replit.dev",
    "*.replit.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for hackathon demo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "message": "Arogya-AI Backend is running",
        "repl_info": {
            "slug": repl_slug,
            "owner": repl_owner
        }
    }

# Include your existing routers
from .captions import router as captions_router
from .appointments import router as appointments_router

app.include_router(captions_router, prefix="/api", tags=["captions"])
app.include_router(appointments_router, prefix="/api", tags=["appointments"])
```

## Step 4: Frontend Configuration for Replit

### 4.1 Update Next.js Config for Replit
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Replit environment detection
  env: {
    REPL_SLUG: process.env.REPL_SLUG,
    REPL_OWNER: process.env.REPL_OWNER,
  },
  
  // Dynamic backend URL based on environment
  publicRuntimeConfig: {
    backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 
                (process.env.REPL_SLUG && process.env.REPL_OWNER 
                  ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co:8080`
                  : 'http://localhost:8000'),
  },
  
  // Replit-specific optimizations
  experimental: {
    serverComponentsExternalPackages: ['ws'],
  },
  
  // Security headers for HTTPS
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'camera=*, microphone=*, display-capture=*',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
    ]
  },
  
  // Webpack config for Replit
  webpack: (config, { dev, isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    return config
  },
  
  // Output configuration
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
}

module.exports = nextConfig
```

### 4.2 Create Replit Environment Helper
```typescript
// lib/replit-config.ts
export const getReplitConfig = () => {
  const isReplit = typeof process !== 'undefined' && 
                   (process.env.REPL_SLUG || process.env.REPLIT_DB_URL)
  
  const replSlug = process.env.REPL_SLUG || process.env.NEXT_PUBLIC_REPL_SLUG
  const replOwner = process.env.REPL_OWNER || process.env.NEXT_PUBLIC_REPL_OWNER
  
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 
    (isReplit && replSlug && replOwner 
      ? `https://${replSlug}.${replOwner}.repl.co:8080`
      : 'http://localhost:8000')
  
  return {
    isReplit,
    replSlug,
    replOwner,
    backendUrl,
    frontendUrl: isReplit && replSlug && replOwner 
      ? `https://${replSlug}.${replOwner}.repl.co`
      : 'http://localhost:3000'
  }
}

// WebRTC configuration for Replit
export const replitWebRTCConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ],
  iceCandidatePoolSize: 10,
}

// Media constraints optimized for Replit
export const replitMediaConstraints = {
  video: {
    width: { ideal: 640, max: 1280 },
    height: { ideal: 480, max: 720 },
    frameRate: { ideal: 15, max: 30 },
    facingMode: 'user'
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 16000,  // Optimized for STT
    channelCount: 1
  }
}
```

## Step 5: Environment Variables (Replit Secrets)

### 5.1 Required Secrets
Go to Replit Secrets tab and add:

```env
# Database (Supabase)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_service_role_key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Google Cloud (for STT/Translation)
GOOGLE_CREDENTIALS_JSON={"type":"service_account","project_id":"..."}

# OpenAI (optional)
OPENAI_API_KEY=sk-...

# Backend URL (auto-configured, but can override)
NEXT_PUBLIC_BACKEND_URL=https://your-repl.username.repl.co:8080
```

### 5.2 Create Environment Setup Script
```python
# backend/setup_credentials.py
import os
import json
import logging

logger = logging.getLogger(__name__)

def setup_google_credentials():
    """Setup Google Cloud credentials from Replit secrets"""
    try:
        # Get credentials from environment
        credentials_json = os.getenv('GOOGLE_CREDENTIALS_JSON')
        
        if not credentials_json:
            logger.warning("GOOGLE_CREDENTIALS_JSON not found in environment")
            logger.info("STT and Translation features will not be available")
            return False
        
        # Parse JSON to validate
        try:
            credentials_data = json.loads(credentials_json)
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON in GOOGLE_CREDENTIALS_JSON: {e}")
            return False
        
        # Create credentials file
        repl_slug = os.getenv('REPL_SLUG', 'arogya-ai')
        credentials_path = f'/home/runner/{repl_slug}/backend/google-credentials.json'
        
        with open(credentials_path, 'w') as f:
            f.write(credentials_json)
        
        # Set environment variable
        os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = credentials_path
        
        logger.info(f"✅ Google credentials configured at {credentials_path}")
        logger.info(f"   Project ID: {credentials_data.get('project_id', 'unknown')}")
        
        return True
        
    except Exception as e:
        logger.error(f"Failed to setup Google credentials: {e}")
        return False

def setup_environment():
    """Setup all environment variables for Replit"""
    logger.info("🔧 Setting up environment for Replit...")
    
    # Setup Google credentials
    google_ok = setup_google_credentials()
    
    # Check other required environment variables
    required_vars = [
        'SUPABASE_URL',
        'SUPABASE_KEY',
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY'
    ]
    
    missing_vars = []
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        logger.warning(f"Missing environment variables: {missing_vars}")
        logger.info("Add these to Replit Secrets for full functionality")
    
    # Log configuration status
    logger.info("📊 Environment Status:")
    logger.info(f"   Google Cloud STT: {'✅' if google_ok else '❌'}")
    logger.info(f"   Database: {'✅' if os.getenv('SUPABASE_URL') else '❌'}")
    logger.info(f"   OpenAI Whisper: {'✅' if os.getenv('OPENAI_API_KEY') else '❌'}")
    
    return True

if __name__ == "__main__":
    setup_environment()
```

## Step 6: Update Package.json for Replit

```json
{
  "name": "arogya-ai-hackathon",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start -p 3000",
    "lint": "next lint",
    "replit-setup": "cd backend && python setup_credentials.py",
    "replit-backend": "cd backend && python replit_run.py",
    "replit-start": "./run.sh"
  },
  "dependencies": {
    "next": "14.0.0",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "@supabase/supabase-js": "^2.38.0",
    "lucide-react": "^0.292.0",
    "tailwindcss": "^3.3.0",
    "@tailwindcss/forms": "^0.5.6",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  },
  "devDependencies": {
    "@types/node": "20.8.0",
    "@types/react": "18.2.0",
    "@types/react-dom": "18.2.0",
    "autoprefixer": "^10.4.16",
    "eslint": "8.51.0",
    "eslint-config-next": "14.0.0",
    "postcss": "^8.4.31",
    "typescript": "5.2.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  }
}
```

## Step 7: Video Call Component Updates for Replit

### 7.1 Update WebRTC Configuration
```typescript
// components/VideoCallRoom.tsx
import { getReplitConfig, replitWebRTCConfig, replitMediaConstraints } from '@/lib/replit-config'

export default function VideoCallRoom({ consultationId, userType }) {
  const { backendUrl, isReplit } = getReplitConfig()
  
  // WebSocket URL for signaling
  const getSignalingUrl = () => {
    const wsUrl = backendUrl.replace('https://', 'wss://').replace('http://', 'ws://')
    return `${wsUrl}/ws/signaling/${consultationId}/${userType}`
  }
  
  // Setup peer connection with Replit-optimized config
  const setupPeerConnection = () => {
    const pc = new RTCPeerConnection(replitWebRTCConfig)
    
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignalingMessage({
          type: 'ice-candidate',
          candidate: event.candidate
        })
      }
    }
    
    return pc
  }
  
  // Get user media with Replit-optimized constraints
  const getUserMedia = async () => {
    try {
      console.log('🎥 Requesting camera and microphone access...')
      const stream = await navigator.mediaDevices.getUserMedia(replitMediaConstraints)
      console.log('✅ Media access granted')
      return stream
    } catch (error) {
      console.error('❌ Media access denied:', error)
      
      // Show user-friendly error message
      if (error.name === 'NotAllowedError') {
        alert('Please allow camera and microphone access for video calls to work. Click the camera icon in your browser\'s address bar.')
      } else if (error.name === 'NotFoundError') {
        alert('No camera or microphone found. Please connect your devices and refresh.')
      }
      
      throw error
    }
  }
  
  // Rest of your component logic...
}
```

### 7.2 Update Live Captions for Replit
```typescript
// components/LiveCaptions.tsx
import { getReplitConfig } from '@/lib/replit-config'

export default function LiveCaptions({ consultationId, userType, localStream, enabled, onToggle }) {
  const { backendUrl } = getReplitConfig()
  
  // WebSocket URL for captions
  const getCaptionWebSocketUrl = () => {
    const wsUrl = backendUrl.replace('https://', 'wss://').replace('http://', 'ws://')
    return `${wsUrl}/ws/captions/${consultationId}/${userType}`
  }
  
  // Rest of your existing LiveCaptions logic...
  // The fixes we implemented earlier will work here too
}
```

## Step 8: Deployment Steps

### 8.1 Upload and Configure
1. **Upload all files** to your Repl
2. **Set executable permissions**:
   ```bash
   chmod +x run.sh
   ```
3. **Add environment variables** in Replit Secrets
4. **Test the configuration**:
   ```bash
   ./run.sh
   ```

### 8.2 Replit Deployment
1. Click **"Deploy"** in Replit
2. Choose **"Autoscale Deployment"**
3. Configure:
   - **Build Command**: `npm run build`
   - **Run Command**: `./run.sh`
   - **Root Directory**: `/`

### 8.3 Custom Domain (Optional)
1. Go to deployment settings
2. Add custom domain
3. Update environment variables with new domain

## Step 9: Testing Checklist for Hackathon

### ✅ Basic Functionality
- [ ] Repl starts without errors
- [ ] Frontend loads at main URL
- [ ] Backend API responds at `:8080/health`
- [ ] Environment variables loaded correctly

### ✅ Video Call Features
- [ ] **CRITICAL**: Open in new tab (not preview) for HTTPS
- [ ] Camera permission granted
- [ ] Microphone permission granted
- [ ] Video stream displays
- [ ] Audio works both directions
- [ ] WebRTC connection establishes

### ✅ Live Captions
- [ ] WebSocket connects to backend
- [ ] Audio capture from microphone
- [ ] Speech-to-text works (if Google Cloud configured)
- [ ] Captions display in real-time
- [ ] Translation works (if configured)

### ✅ Database Features
- [ ] Supabase connection works
- [ ] User registration/login
- [ ] Appointment scheduling
- [ ] Data persistence

## Step 10: Hackathon Demo Tips

### 10.1 Demo Preparation
```bash
# Quick health check script
echo "🔍 Arogya-AI Health Check"
echo "========================"
echo "Frontend: $(curl -s -o /dev/null -w "%{http_code}" https://$REPL_SLUG.$REPL_OWNER.repl.co)"
echo "Backend: $(curl -s -o /dev/null -w "%{http_code}" https://$REPL_SLUG.$REPL_OWNER.repl.co:8080/health)"
echo "WebSocket: Testing..."
```

### 10.2 Demo Script
1. **Show the landing page** - explain the problem
2. **Register as doctor and patient** - show user management
3. **Schedule appointment** - demonstrate scheduling system
4. **Start video call** - show WebRTC working
5. **Enable live captions** - demonstrate real-time STT
6. **Upload lab report** - show AI analysis
7. **Show community lexicon** - explain regional terms

### 10.3 Fallback Plans
- **If Google Cloud STT fails**: Use Web Speech API fallback
- **If video fails**: Show screenshots/video recording
- **If database fails**: Use local storage demo data
- **If Repl is slow**: Have backup deployment ready

## Step 11: Troubleshooting

### Common Replit Issues

#### 1. "Module not found" errors
```bash
# Clear cache and reinstall
rm -rf node_modules .next backend/__pycache__
rm .deps_installed .node_deps_installed .frontend_built
./run.sh
```

#### 2. Video calls not working
- **Always use "Open in new tab"** - preview doesn't support WebRTC
- Check HTTPS is enabled
- Verify camera/microphone permissions
- Test with different browsers

#### 3. WebSocket connection fails
```bash
# Check if backend is running
curl https://$REPL_SLUG.$REPL_OWNER.repl.co:8080/health

# Check WebSocket endpoint
wscat -c wss://$REPL_SLUG.$REPL_OWNER.repl.co:8080/ws/captions/test/doctor
```

#### 4. Environment variables not loading
- Check Replit Secrets are set correctly
- Restart the Repl completely
- Verify secret names match exactly

### Performance Optimization for Replit
```bash
# Add to run.sh for better performance
export NODE_OPTIONS="--max-old-space-size=512"
export PYTHONUNBUFFERED=1
export PYTHONDONTWRITEBYTECODE=1
```

## Step 12: Hackathon Submission

### 12.1 Submission Checklist
- [ ] **Working Repl URL** with all features
- [ ] **Demo video** showing key features
- [ ] **README** with setup instructions
- [ ] **Architecture diagram** explaining the system
- [ ] **Problem statement** and solution explanation

### 12.2 Key Selling Points
1. **Real-time multilingual communication** in healthcare
2. **AI-powered features** (STT, translation, medical analysis)
3. **Community-driven lexicon** for regional medical terms
4. **Complete telemedicine platform** with video calls
5. **Accessibility focus** for rural healthcare

### 12.3 Technical Highlights
- **WebRTC** for peer-to-peer video calls
- **WebSocket** for real-time captions
- **Google Cloud STT** for accurate transcription
- **Supabase** for scalable database
- **Next.js + FastAPI** for modern full-stack architecture

This guide ensures your Arogya-AI application works perfectly on Replit for the hackathon, with all video calling and live caption features functioning correctly!