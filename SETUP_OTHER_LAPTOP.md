# Setup Guide for Second Laptop (Patient/Doctor)

## 🎯 Goal
Run frontend on both laptops (localhost for camera access) while sharing the same backend.

## 📋 Prerequisites
- Both laptops on same WiFi
- Backend running on Laptop 1 (IP: 10.20.18.252)

---

## 🖥️ Laptop 1 (Backend + Frontend)

### Already Running:
✅ Backend: `http://10.20.18.252:8000`
✅ Frontend: `http://localhost:3000`

### Keep Backend Running:
```bash
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## 💻 Laptop 2 (Frontend Only)

### Step 1: Get the Project

**Option A: Clone from GitHub**
```bash
git clone https://github.com/KURO-1125/Vibeathon.git
cd Vibeathon/frontend
```

**Option B: Copy via USB/Network**
- Copy the entire `Vibeathon` folder to Laptop 2
- Navigate to `Vibeathon/frontend`

### Step 2: Install Dependencies
```bash
cd frontend
npm install
```

### Step 3: Configure Environment

Create/Edit `frontend/.env.local`:
```env
NEXT_PUBLIC_BACKEND_URL=http://10.20.18.252:8000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key
```

**Copy these values from Laptop 1's `.env.local` file!**

### Step 4: Start Frontend
```bash
npm run dev
```

Should show:
```
✓ Ready in 2.5s
○ Local:   http://localhost:3000
```

### Step 5: Test Connection

**Open browser on Laptop 2:**
1. Go to: `http://localhost:3000`
2. Should see the login page
3. Camera/mic permissions will work (localhost)

---

## 🧪 Testing Video Call

### Laptop 1 (Doctor):
1. Open: `http://localhost:3000`
2. Login as doctor
3. Go to "My Appointments"
4. Click "Join Call"
5. Allow camera/mic
6. Wait for patient...

### Laptop 2 (Patient):
1. Open: `http://localhost:3000`
2. Login as patient
3. Go to "My Appointments"
4. Click "Join Call" on SAME appointment
5. Allow camera/mic
6. Should connect in 3-5 seconds!

---

## 🔍 Troubleshooting

### Issue: "Cannot connect to backend"

**Check backend is accessible from Laptop 2:**
```bash
# On Laptop 2, open browser:
http://10.20.18.252:8000/docs
```

Should see API documentation. If not:
- Check firewall on Laptop 1
- Run `ALLOW_FIREWALL.bat` as admin on Laptop 1
- Verify both on same WiFi

### Issue: "Camera/mic blocked"

**Check you're using localhost:**
- URL should be: `http://localhost:3000` ✅
- NOT: `http://10.20.18.252:3000` ❌

### Issue: "Signaling not connected"

**Check backend logs on Laptop 1:**
Should see:
```
INFO: WebSocket /ws/signaling/... [accepted]
INFO: ✅ doctor joined room ...
INFO: ✅ patient joined room ...
```

If not, restart backend.

### Issue: "Video not connecting"

**Check console logs (F12) on both laptops:**

Should see:
- ✅ Local media obtained
- ✅ Signaling connected
- 📤 Creating offer (doctor)
- 📥 Received offer (patient)
- ✅ Answer sent (patient)
- 📥 Received answer (doctor)
- 🔗 Connection state: connected

---

## 📊 Network Architecture

```
┌─────────────────────────────────────────────┐
│           Same WiFi Network                 │
│                                             │
│  ┌──────────────┐      ┌──────────────┐   │
│  │  Laptop 1    │      │  Laptop 2    │   │
│  │              │      │              │   │
│  │ Backend:8000 │◄─────┤ Frontend     │   │
│  │ Frontend:3000│      │ :3000        │   │
│  │              │      │              │   │
│  │ (Doctor)     │      │ (Patient)    │   │
│  └──────────────┘      └──────────────┘   │
│         │                      │           │
│         └──────────┬───────────┘           │
│                    │                       │
│         WebRTC P2P Connection             │
│         (Video/Audio Direct)              │
└─────────────────────────────────────────────┘
```

**Key Points:**
- Both access frontend via `localhost:3000` (camera works)
- Both connect to backend via `10.20.18.252:8000` (signaling)
- Video/audio flows directly between laptops (WebRTC P2P)

---

## ✅ Success Checklist

- [ ] Backend running on Laptop 1 (port 8000)
- [ ] Frontend running on Laptop 1 (port 3000)
- [ ] Frontend running on Laptop 2 (port 3000)
- [ ] Both can access `http://10.20.18.252:8000/docs`
- [ ] Both can login at `http://localhost:3000`
- [ ] Camera/mic permissions granted on both
- [ ] Both join same appointment
- [ ] Video call connects successfully

---

## 🎉 Expected Result

When both users join:
- See your own video (mirrored)
- See other person's video
- Hear each other
- Green "Connected" indicator
- Working controls (mute, video toggle)

---

## 💡 Tips

1. **Doctor should join first** - Creates the offer
2. **Patient joins second** - Answers the offer
3. **Wait 3-5 seconds** - Connection takes time
4. **Check console logs** - F12 to see what's happening
5. **Same appointment ID** - Both must join the same appointment!

---

## 🆘 Still Not Working?

1. Check both laptops are on same WiFi
2. Verify backend is accessible from Laptop 2
3. Check firewall settings on Laptop 1
4. Ensure using `localhost:3000` on both (not IP)
5. Check browser console for errors
6. Verify same appointment ID
7. Try restarting backend and frontends

---

## 📝 Quick Commands Reference

**Laptop 1 (Backend):**
```bash
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Laptop 1 (Frontend):**
```bash
cd frontend
npm run dev
```

**Laptop 2 (Frontend):**
```bash
cd frontend
npm run dev
```

**Test Backend Access:**
```
http://10.20.18.252:8000/docs
```

**Access Frontend:**
```
http://localhost:3000
```

---

Good luck! 🚀
