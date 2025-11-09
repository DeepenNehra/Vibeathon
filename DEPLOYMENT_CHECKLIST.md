# Deployment Checklist - Frontend & Backend Separate

## 🎯 Quick Deployment Guide

### Backend Deployment (Railway - RECOMMENDED)

#### 1. Railway Setup
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Create new project → "Deploy from GitHub repo"
4. Select your repository
5. Choose `backend` folder as root directory

#### 2. Railway Environment Variables
```env
# Required
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_service_role_key
GOOGLE_CREDENTIALS_JSON={"type":"service_account",...}

# Optional
OPENAI_API_KEY=sk-...
FRONTEND_URL=https://your-app.vercel.app

# Auto-set by Railway
PORT=8000
RAILWAY_ENVIRONMENT=production
```

#### 3. Railway Configuration
- **Start Command**: `python railway_main.py`
- **Build Command**: `pip install -r requirements.txt`
- **Health Check**: `/health`

---

### Frontend Deployment (Vercel - RECOMMENDED)

#### 1. Vercel Setup
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Import project → Select your repository
4. Choose `frontend` folder as root directory

#### 2. Vercel Environment Variables
```env
# Required - Replace with your Railway backend URL
NEXT_PUBLIC_BACKEND_URL=https://your-backend.railway.app

# Required - Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Optional
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

#### 3. Vercel Configuration
- **Framework**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Root Directory**: `frontend`

---

## 🔧 Configuration Files Created

### Backend Files
- ✅ `backend/railway_main.py` - Railway entry point
- ✅ `backend/railway.toml` - Railway configuration
- ✅ Updated `backend/app/main.py` - Production CORS

### Frontend Files
- ✅ `frontend/vercel.json` - Vercel configuration
- ✅ `frontend/lib/config.ts` - Production config helper
- ✅ Updated `frontend/package.json` - Build scripts

---

## 🚀 Deployment Steps

### Step 1: Deploy Backend First
1. **Push code** to GitHub
2. **Connect Railway** to your repository
3. **Set environment variables** in Railway dashboard
4. **Deploy** and get Railway URL
5. **Test** health endpoint: `https://your-backend.railway.app/health`

### Step 2: Deploy Frontend
1. **Update environment variables** with Railway backend URL
2. **Connect Vercel** to your repository
3. **Set environment variables** in Vercel dashboard
4. **Deploy** and get Vercel URL
5. **Test** frontend loads correctly

### Step 3: Update CORS
1. **Add Vercel URL** to Railway environment variable `FRONTEND_URL`
2. **Redeploy backend** to update CORS settings
3. **Test** API calls from frontend to backend

---

## ✅ Testing Checklist

### Backend Testing
- [ ] Health endpoint responds: `/health`
- [ ] API documentation loads: `/docs`
- [ ] WebSocket connects: `/ws/captions/test/doctor`
- [ ] Database connection works
- [ ] Google Cloud STT configured (if available)

### Frontend Testing
- [ ] **CRITICAL**: Open in new tab (not preview) for HTTPS
- [ ] Frontend loads without errors
- [ ] API calls reach backend successfully
- [ ] Camera/microphone permissions work
- [ ] WebSocket connections establish
- [ ] Video calls work end-to-end

### Integration Testing
- [ ] User registration/login works
- [ ] Video call room loads
- [ ] Live captions connect and work
- [ ] Database operations succeed
- [ ] No CORS errors in console

---

## 🎬 Video Call Requirements

### HTTPS Required
- ✅ Vercel provides automatic HTTPS
- ✅ Railway provides automatic HTTPS
- ⚠️ Always use "Open in new tab" for video features

### WebRTC Configuration
- ✅ STUN servers configured in `frontend/lib/config.ts`
- ✅ Media constraints optimized for production
- ✅ Error handling for permissions

### Browser Permissions
- Camera access required
- Microphone access required
- Display capture (for screen sharing)

---

## 🔍 Troubleshooting

### Common Issues

#### 1. CORS Errors
```
Access to fetch at 'backend-url' from origin 'frontend-url' has been blocked by CORS policy
```
**Solution**: Add frontend URL to `FRONTEND_URL` environment variable in Railway

#### 2. WebSocket Connection Failed
```
WebSocket connection to 'wss://backend-url/ws/captions' failed
```
**Solution**: 
- Check backend is deployed and running
- Verify WebSocket URL uses `wss://` for HTTPS
- Check firewall/proxy settings

#### 3. Camera/Microphone Not Working
```
NotAllowedError: Permission denied
```
**Solution**:
- Ensure using HTTPS (not HTTP)
- Click "Open in new tab" (not preview)
- Grant permissions in browser settings

#### 4. Environment Variables Not Loading
```
NEXT_PUBLIC_BACKEND_URL is undefined
```
**Solution**:
- Check environment variables are set in Vercel dashboard
- Redeploy frontend after adding variables
- Verify variable names match exactly

---

## 📊 Monitoring

### Backend Monitoring (Railway)
- Check Railway dashboard for logs
- Monitor `/health` endpoint
- Watch for memory/CPU usage

### Frontend Monitoring (Vercel)
- Check Vercel dashboard for build logs
- Monitor Core Web Vitals
- Watch for runtime errors

### Database Monitoring (Supabase)
- Check Supabase dashboard
- Monitor API usage
- Watch for connection issues

---

## 🎯 Production URLs

After deployment, you'll have:

- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend.railway.app`
- **API Docs**: `https://your-backend.railway.app/docs`
- **Health Check**: `https://your-backend.railway.app/health`

Update these URLs in your environment variables and test all features work correctly!

---

## 🏆 Success Criteria

Your deployment is successful when:

1. ✅ Frontend loads on Vercel with HTTPS
2. ✅ Backend responds on Railway with HTTPS  
3. ✅ API calls work between frontend and backend
4. ✅ WebSocket connections establish successfully
5. ✅ Video calls work with camera/microphone
6. ✅ Live captions transcribe speech in real-time
7. ✅ Database operations complete successfully
8. ✅ No CORS or connection errors in console

**Ready for hackathon demo! 🎉**