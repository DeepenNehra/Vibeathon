# Production Deployment Guide - Video Calls & All Features Working

## Overview
This guide ensures your video calling app works perfectly in production with HTTPS, WebRTC, live captions, and all features.

## Deployment Options (Recommended Order)

### Option 1: Vercel + Railway (Recommended)
- **Frontend**: Vercel (automatic HTTPS, global CDN)
- **Backend**: Railway (persistent storage, WebSocket support)
- **Database**: Supabase (managed PostgreSQL)

### Option 2: Netlify + Render
- **Frontend**: Netlify
- **Backend**: Render
- **Database**: Supabase

### Option 3: Single Platform (Replit Pro)
- **Full Stack**: Replit with custom domain + SSL

## Option 1: Vercel + Railway Deployment (RECOMMENDED)

### Step 1: Deploy Backend to Railway

#### 1.1 Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Create new project

#### 1.2 Prepare Backend for Railway
```python
# backend/railway_run.py
import os
import uvicorn
from setup_credentials import setup_google_credentials

def main():
    # Setup Google credentials
    setup_google_credentials()
    
    # Railway provides PORT environment variable
    port = int(os.getenv("PORT", 8000))
    host = "0.0.0.0"
    
    print(f"🚀 Starting FastAPI server on {host}:{port}")
    
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=False,
        log_level="info"
    )

if __name__ == "__main__":
    main()
```

#### 1.3 Create Railway Configuration
```toml
# railway.toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "python railway_run.py"
healthcheckPath = "/health"
healthcheckTimeout = 300
restartPolicyType = "on_failure"

[[services]]
name = "backend"
source = "backend"
```

#### 1.4 Backend Environment Variables (Railway)
Set these in Railway dashboard:
```env
# Google Cloud
GOOGLE_CREDENTIALS_JSON={"type":"service_account",...}

# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_service_role_key

# OpenAI (optional)
OPENAI_API_KEY=sk-...

# CORS Origins (add your Vercel domain)
ALLOWED_ORIGINS=https://your-app.vercel.app,http://localhost:3000
```

#### 1.5 Update CORS for Production
```python
# backend/app/main.py
import os
from fastapi.middleware.cors import CORSMiddleware

# Get allowed origins from environment
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Step 2: Deploy Frontend to Vercel

#### 2.1 Prepare Frontend for Vercel
```javascript
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "functions": {
    "pages/api/**/*.js": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=*, microphone=*, display-capture=*"
        }
      ]
    }
  ]
}
```

#### 2.2 Update Next.js Config for Production
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  
  // Enable WebRTC and WebSocket support
  experimental: {
    serverComponentsExternalPackages: ['ws'],
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=*, microphone=*, display-capture=*',
          },
        ],
      },
    ]
  },
  
  // Optimize for production
  compress: true,
  poweredByHeader: false,
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
}

module.exports = nextConfig
```

#### 2.3 Frontend Environment Variables (Vercel)
Set these in Vercel dashboard:
```env
NEXT_PUBLIC_BACKEND_URL=https://your-backend.railway.app
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Step 3: Configure WebRTC for Production

#### 3.1 Update WebRTC Configuration
```typescript
// frontend/lib/webrtc-config.ts
export const webrtcConfig = {
  iceServers: [
    // Free STUN servers
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    
    // For production, consider using TURN servers
    // {
    //   urls: 'turn:your-turn-server.com:3478',
    //   username: 'username',
    //   credential: 'password'
    // }
  ],
  iceCandidatePoolSize: 10,
}

// Media constraints for better compatibility
export const mediaConstraints = {
  video: {
    width: { ideal: 1280, max: 1920 },
    height: { ideal: 720, max: 1080 },
    frameRate: { ideal: 30, max: 60 },
    facingMode: 'user'
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 48000,
    channelCount: 1
  }
}
```

#### 3.2 Update Video Call Component
```typescript
// frontend/components/VideoCallRoom.tsx
import { webrtcConfig, mediaConstraints } from '@/lib/webrtc-config'

// In your component
const setupPeerConnection = () => {
  const pc = new RTCPeerConnection(webrtcConfig)
  
  // Handle ICE candidates
  pc.onicecandidate = (event) => {
    if (event.candidate) {
      // Send candidate to other peer via WebSocket
      sendSignalingMessage({
        type: 'ice-candidate',
        candidate: event.candidate
      })
    }
  }
  
  return pc
}

const getUserMedia = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints)
    return stream
  } catch (error) {
    console.error('Error accessing media devices:', error)
    
    // Fallback with reduced constraints
    try {
      const fallbackStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      return fallbackStream
    } catch (fallbackError) {
      throw new Error('Camera and microphone access denied')
    }
  }
}
```

### Step 4: Fix WebSocket URLs for Production

#### 4.1 Update WebSocket Connection Logic
```typescript
// frontend/components/LiveCaptions.tsx
const getWebSocketUrl = () => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
  
  // Convert HTTP/HTTPS to WS/WSS
  let wsUrl: string
  if (backendUrl.startsWith('https://')) {
    wsUrl = backendUrl.replace('https://', 'wss://')
  } else if (backendUrl.startsWith('http://')) {
    wsUrl = backendUrl.replace('http://', 'ws://')
  } else {
    // Default to secure WebSocket in production
    wsUrl = `wss://${backendUrl}`
  }
  
  return wsUrl
}

// Use in WebSocket connection
const wsUrl = getWebSocketUrl()
const wsEndpoint = `${wsUrl}/ws/captions/${consultationId}/${userType}`
```

### Step 5: Database Setup (Supabase)

#### 5.1 Create Production Database
```sql
-- Run in Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    name VARCHAR NOT NULL,
    role VARCHAR CHECK (role IN ('doctor', 'patient')) NOT NULL,
    phone VARCHAR,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Consultations table
CREATE TABLE IF NOT EXISTS consultations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    doctor_id UUID REFERENCES users(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled')),
    transcript TEXT,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    doctor_id UUID REFERENCES users(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status VARCHAR DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Community lexicon table
CREATE TABLE IF NOT EXISTS community_lexicon (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    regional_term VARCHAR NOT NULL,
    english_equivalent VARCHAR NOT NULL,
    language VARCHAR NOT NULL,
    embedding VECTOR(384),
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Lab reports table
CREATE TABLE IF NOT EXISTS lab_reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    consultation_id UUID REFERENCES consultations(id) ON DELETE SET NULL,
    file_url VARCHAR NOT NULL,
    analysis_result JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_consultations_doctor_id ON consultations(doctor_id);
CREATE INDEX IF NOT EXISTS idx_consultations_patient_id ON consultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date ON appointments(doctor_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_date ON appointments(patient_id, appointment_date);

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_lexicon ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Consultations viewable by participants" ON consultations 
FOR SELECT USING (auth.uid() = doctor_id OR auth.uid() = patient_id);

CREATE POLICY "Appointments viewable by participants" ON appointments 
FOR SELECT USING (auth.uid() = doctor_id OR auth.uid() = patient_id);
```

### Step 6: Deployment Steps

#### 6.1 Deploy Backend to Railway
1. Connect GitHub repo to Railway
2. Select `backend` folder as root
3. Set environment variables
4. Deploy and get Railway URL

#### 6.2 Deploy Frontend to Vercel
1. Connect GitHub repo to Vercel
2. Set root directory to project root
3. Set environment variables with Railway backend URL
4. Deploy and get Vercel URL

#### 6.3 Update CORS Origins
Update Railway backend environment:
```env
ALLOWED_ORIGINS=https://your-app.vercel.app,https://your-custom-domain.com
```

### Step 7: Custom Domain & SSL (Optional)

#### 7.1 Add Custom Domain to Vercel
1. Go to Vercel project settings
2. Add custom domain
3. Configure DNS records

#### 7.2 Add Custom Domain to Railway
1. Go to Railway project settings
2. Add custom domain for backend
3. Update frontend environment variables

### Step 8: Testing Checklist

#### ✅ HTTPS & Security
- [ ] Frontend loads with HTTPS
- [ ] Backend API accessible via HTTPS
- [ ] WebSocket connections use WSS
- [ ] No mixed content warnings

#### ✅ WebRTC Video Calls
- [ ] Camera permission granted
- [ ] Microphone permission granted
- [ ] Video stream displays correctly
- [ ] Audio works both ways
- [ ] Screen sharing works (if implemented)
- [ ] Connection works across different networks

#### ✅ Live Captions
- [ ] WebSocket connects successfully
- [ ] Audio capture works
- [ ] Speech-to-text transcription
- [ ] Translation between languages
- [ ] Captions display in real-time

#### ✅ Database Features
- [ ] User registration/login
- [ ] Appointment scheduling
- [ ] Consultation history
- [ ] Lab report upload/analysis

### Step 9: Performance Optimization

#### 9.1 Frontend Optimization
```javascript
// next.config.js additions
const nextConfig = {
  // ... existing config
  
  // Bundle analyzer (development only)
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': path.resolve(__dirname),
      }
    }
    return config
  },
  
  // Compression
  compress: true,
  
  // Static optimization
  trailingSlash: false,
  
  // Image optimization
  images: {
    domains: ['your-domain.com', 'supabase.co'],
    formats: ['image/webp', 'image/avif'],
  },
}
```

#### 9.2 Backend Optimization
```python
# backend/app/main.py additions
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles

# Add compression
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Optimize JSON responses
from fastapi.responses import ORJSONResponse
app = FastAPI(default_response_class=ORJSONResponse)
```

### Step 10: Monitoring & Logging

#### 10.1 Frontend Error Tracking
```typescript
// pages/_app.tsx
import { useEffect } from 'react'

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Global error handler
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error)
      // Send to monitoring service
    })
    
    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason)
      // Send to monitoring service
    })
  }, [])
  
  return <Component {...pageProps} />
}
```

#### 10.2 Backend Logging
```python
# backend/app/main.py
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('app.log')
    ]
)

logger = logging.getLogger(__name__)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = datetime.now()
    response = await call_next(request)
    process_time = (datetime.now() - start_time).total_seconds()
    
    logger.info(
        f"{request.method} {request.url.path} - "
        f"Status: {response.status_code} - "
        f"Time: {process_time:.3f}s"
    )
    
    return response
```

## Troubleshooting Common Issues

### Video Call Issues
1. **Camera/Microphone not working**: Check HTTPS, permissions
2. **Connection fails**: Check STUN/TURN servers, firewall
3. **Poor quality**: Adjust media constraints, check bandwidth

### WebSocket Issues
1. **Connection drops**: Check WSS protocol, proxy settings
2. **CORS errors**: Update allowed origins in backend
3. **Authentication**: Ensure proper headers sent

### Performance Issues
1. **Slow loading**: Enable compression, optimize images
2. **High latency**: Use CDN, optimize database queries
3. **Memory leaks**: Check WebRTC cleanup, event listeners

This deployment guide ensures your video calling application works perfectly in production with all features functioning correctly.