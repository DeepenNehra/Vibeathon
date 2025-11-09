# Separate Platform Deployment Guide

## Overview
Deploy frontend and backend on different platforms for optimal performance, scalability, and cost-effectiveness.

## Recommended Platform Combinations

### Option 1: Vercel + Railway (RECOMMENDED)
- **Frontend**: Vercel (Best for Next.js, automatic HTTPS, global CDN)
- **Backend**: Railway (Great for Python/FastAPI, WebSocket support, persistent storage)

### Option 2: Netlify + Render
- **Frontend**: Netlify (Great alternative to Vercel)
- **Backend**: Render (Good Railway alternative)

### Option 3: Vercel + Google Cloud Run
- **Frontend**: Vercel
- **Backend**: Google Cloud Run (Best if using Google Cloud services)

---

# PART 1: BACKEND DEPLOYMENT

## Option A: Railway Backend Deployment

### Step 1: Prepare Backend for Railway

#### 1.1 Create Railway-Specific Files
```python
# backend/railway_main.py
"""
Railway deployment entry point
"""
import os
import sys
import uvicorn
import logging
from pathlib import Path

# Add current directory to Python path
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

def setup_logging():
    """Configure logging for Railway"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )

def setup_credentials():
    """Setup Google Cloud credentials from environment"""
    try:
        import json
        credentials_json = os.getenv('GOOGLE_CREDENTIALS_JSON')
        
        if credentials_json:
            # Create credentials file
            credentials_path = '/tmp/google-credentials.json'
            with open(credentials_path, 'w') as f:
                f.write(credentials_json)
            
            os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = credentials_path
            print("✅ Google Cloud credentials configured")
        else:
            print("⚠️ GOOGLE_CREDENTIALS_JSON not found")
            
    except Exception as e:
        print(f"❌ Error setting up credentials: {e}")

def main():
    """Main entry point"""
    print("🚀 Starting Arogya-AI Backend on Railway...")
    
    setup_logging()
    setup_credentials()
    
    # Railway provides PORT environment variable
    port = int(os.getenv("PORT", 8000))
    host = "0.0.0.0"
    
    print(f"🌐 Server starting on {host}:{port}")
    
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=False,
        log_level="info",
        workers=1
    )

if __name__ == "__main__":
    main()
```

#### 1.2 Create Railway Configuration
```toml
# backend/railway.toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "python railway_main.py"
healthcheckPath = "/health"
healthcheckTimeout = 300
restartPolicyType = "on_failure"

[variables]
PYTHONPATH = "/app"
PORT = "8000"
```

#### 1.3 Update Backend CORS for Production
```python
# backend/app/main.py
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Arogya-AI Backend",
    description="Healthcare AI Platform API",
    version="1.0.0"
)

# Production CORS configuration
allowed_origins = [
    "http://localhost:3000",  # Local development
    "https://your-app.vercel.app",  # Replace with your Vercel domain
    "https://arogya-ai.vercel.app",  # Example production domain
]

# Add environment-based origins
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    allowed_origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
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
        "version": "1.0.0"
    }

# Include routers
from .captions import router as captions_router
from .appointments import router as appointments_router

app.include_router(captions_router, prefix="/api", tags=["captions"])
app.include_router(appointments_router, prefix="/api", tags=["appointments"])
```

### Step 2: Deploy to Railway

#### 2.1 Railway Deployment Steps
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Create new project
4. Connect GitHub repository
5. Select `backend` folder as root directory
6. Set environment variables (see below)
7. Deploy

#### 2.2 Railway Environment Variables
```env
# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_service_role_key

# Google Cloud
GOOGLE_CREDENTIALS_JSON={"type":"service_account",...}

# OpenAI (optional)
OPENAI_API_KEY=sk-...

# Frontend URL (for CORS)
FRONTEND_URL=https://your-app.vercel.app

# Railway specific
PORT=8000
PYTHONPATH=/app
```

---

## Option B: Render Backend Deployment

### Step 1: Prepare for Render
```python
# backend/render_main.py
"""
Render deployment entry point
"""
import os
import sys
import uvicorn
from pathlib import Path

# Add current directory to Python path
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

def setup_credentials():
    """Setup Google Cloud credentials"""
    try:
        import json
        credentials_json = os.getenv('GOOGLE_CREDENTIALS_JSON')
        
        if credentials_json:
            credentials_path = '/opt/render/project/src/google-credentials.json'
            with open(credentials_path, 'w') as f:
                f.write(credentials_json)
            
            os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = credentials_path
            print("✅ Google Cloud credentials configured")
            
    except Exception as e:
        print(f"❌ Error setting up credentials: {e}")

def main():
    """Main entry point for Render"""
    print("🚀 Starting Arogya-AI Backend on Render...")
    
    setup_credentials()
    
    port = int(os.getenv("PORT", 8000))
    host = "0.0.0.0"
    
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

### Step 2: Render Configuration
```yaml
# backend/render.yaml
services:
  - type: web
    name: arogya-ai-backend
    env: python
    buildCommand: "pip install -r requirements.txt"
    startCommand: "python render_main.py"
    healthCheckPath: "/health"
    envVars:
      - key: PYTHON_VERSION
        value: 3.11.0
      - key: PORT
        value: 8000
```

---

# PART 2: FRONTEND DEPLOYMENT

## Option A: Vercel Frontend Deployment (RECOMMENDED)

### Step 1: Prepare Frontend for Vercel

#### 1.1 Create Vercel Configuration
```json
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
          "key": "Permissions-Policy",
          "value": "camera=*, microphone=*, display-capture=*"
        },
        {
          "key": "X-Frame-Options",
          "value": "SAMEORIGIN"
        }
      ]
    }
  ]
}
```

#### 1.2 Update Next.js Config for Production
```javascript
// frontend/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Environment variables
  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  
  // Security headers
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
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
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
  
  // Webpack optimization
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
}

module.exports = nextConfig
```

#### 1.3 Create Production Configuration Helper
```typescript
// frontend/lib/config.ts
/**
 * Production configuration helper
 */

export const getConfig = () => {
  // Backend URL from environment or default
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
  
  // Supabase configuration
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  
  // WebSocket URL (convert HTTP/HTTPS to WS/WSS)
  const wsUrl = backendUrl.replace('https://', 'wss://').replace('http://', 'ws://')
  
  return {
    backendUrl,
    wsUrl,
    supabase: {
      url: supabaseUrl,
      anonKey: supabaseAnonKey,
    },
    // WebRTC configuration for production
    webrtc: {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
      ],
      iceCandidatePoolSize: 10,
    },
    // Media constraints for production
    mediaConstraints: {
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
  }
}

// Helper to check if we're in production
export const isProduction = () => process.env.NODE_ENV === 'production'

// Helper to get WebSocket URL for different services
export const getWebSocketUrl = (service: 'captions' | 'signaling', consultationId: string, userType: string) => {
  const { wsUrl } = getConfig()
  return `${wsUrl}/ws/${service}/${consultationId}/${userType}`
}
```

### Step 2: Deploy to Vercel

#### 2.1 Vercel Deployment Steps
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Import your repository
4. Select `frontend` folder as root directory
5. Set environment variables (see below)
6. Deploy

#### 2.2 Vercel Environment Variables
```env
# Backend URL (Railway/Render URL)
NEXT_PUBLIC_BACKEND_URL=https://your-backend.railway.app

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Optional: Analytics, monitoring
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

---

## Option B: Netlify Frontend Deployment

### Step 1: Netlify Configuration
```toml
# frontend/netlify.toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"

[[headers]]
  for = "/*"
  [headers.values]
    Permissions-Policy = "camera=*, microphone=*, display-capture=*"
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"

[[redirects]]
  from = "/api/backend/*"
  to = "https://your-backend.railway.app/:splat"
  status = 200
  force = true
```

### Step 2: Deploy to Netlify
1. Go to [netlify.com](https://netlify.com)
2. Connect GitHub repository
3. Set build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
4. Set environment variables
5. Deploy

---

# PART 3: UPDATE COMPONENTS FOR PRODUCTION

## Update Video Call Component
```typescript
// frontend/components/VideoCallRoom.tsx
import { getConfig, getWebSocketUrl } from '@/lib/config'

export default function VideoCallRoom({ consultationId, userType }) {
  const config = getConfig()
  
  // Use production WebSocket URL
  const signalingUrl = getWebSocketUrl('signaling', consultationId, userType)
  
  // Setup peer connection with production config
  const setupPeerConnection = () => {
    const pc = new RTCPeerConnection(config.webrtc)
    
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        // Send via WebSocket to backend
        sendSignalingMessage({
          type: 'ice-candidate',
          candidate: event.candidate
        })
      }
    }
    
    return pc
  }
  
  // Get user media with production constraints
  const getUserMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(config.mediaConstraints)
      return stream
    } catch (error) {
      console.error('Media access error:', error)
      throw error
    }
  }
  
  // Rest of your component logic...
}
```

## Update Live Captions Component
```typescript
// frontend/components/LiveCaptions.tsx
import { getConfig, getWebSocketUrl } from '@/lib/config'

export default function LiveCaptions({ consultationId, userType, localStream, enabled, onToggle }) {
  const config = getConfig()
  
  // Use production WebSocket URL
  const captionWsUrl = getWebSocketUrl('captions', consultationId, userType)
  
  // WebSocket connection with production URL
  const connectWebSocket = async () => {
    console.log(`🔌 Connecting to: ${captionWsUrl}`)
    
    const ws = new WebSocket(captionWsUrl)
    
    ws.onopen = () => {
      console.log('✅ Caption WebSocket connected')
      setIsConnected(true)
    }
    
    // Rest of your WebSocket logic...
    
    return ws
  }
  
  // Rest of your component logic...
}
```

---

# PART 4: DEPLOYMENT CHECKLIST

## Backend Deployment Checklist
- [ ] Choose platform (Railway/Render/Google Cloud Run)
- [ ] Create platform-specific entry point
- [ ] Set environment variables
- [ ] Configure CORS with frontend URL
- [ ] Test health endpoint
- [ ] Test WebSocket connections
- [ ] Verify Google Cloud credentials
- [ ] Test database connection

## Frontend Deployment Checklist
- [ ] Choose platform (Vercel/Netlify)
- [ ] Update backend URL in environment
- [ ] Configure build settings
- [ ] Set environment variables
- [ ] Test HTTPS (required for WebRTC)
- [ ] Test camera/microphone permissions
- [ ] Test WebSocket connections
- [ ] Verify all API calls work

## Integration Testing
- [ ] Frontend can reach backend API
- [ ] WebSocket connections work
- [ ] Video calls establish successfully
- [ ] Live captions work end-to-end
- [ ] Database operations work
- [ ] File uploads work (if applicable)

---

# PART 5: MONITORING AND MAINTENANCE

## Backend Monitoring
```python
# backend/app/monitoring.py
import logging
import time
from fastapi import Request

logger = logging.getLogger(__name__)

async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    
    logger.info(
        f"{request.method} {request.url.path} - "
        f"Status: {response.status_code} - "
        f"Time: {process_time:.3f}s"
    )
    
    return response
```

## Frontend Error Tracking
```typescript
// frontend/lib/error-tracking.ts
export const trackError = (error: Error, context?: string) => {
  console.error(`Error${context ? ` in ${context}` : ''}:`, error)
  
  // Send to monitoring service (e.g., Sentry, LogRocket)
  if (process.env.NODE_ENV === 'production') {
    // Add your error tracking service here
  }
}
```

This separate deployment approach gives you:
- **Better performance** (optimized for each platform)
- **Independent scaling** (scale frontend and backend separately)
- **Cost optimization** (use free tiers effectively)
- **Better reliability** (isolated failures)
- **Easier maintenance** (deploy components independently)