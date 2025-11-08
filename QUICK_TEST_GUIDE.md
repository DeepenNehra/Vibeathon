# Quick Test Guide - Doctor-Patient Video Call on Different Devices

## Your Network Setup
- **Your Computer IP:** `10.20.18.252`
- **Access URL for other devices:** `http://10.20.18.252:3000`

## Option 1: Quick Start (Easiest)

Just double-click: **`START_FOR_DIFFERENT_DEVICES.bat`**

This will:
- Add firewall rules (if run as Administrator)
- Start backend server
- Start frontend server
- Open in separate windows

## Option 2: Manual Start

**Terminal 1 - Backend:**
```cmd
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```cmd
cd frontend
npm run dev
```

## Testing Steps

### On This Computer (Doctor):
1. Open browser: `http://localhost:3000`
2. Login as doctor
3. Go to "My Appointments"
4. Click "Join Call" on any appointment
5. Allow camera/microphone permissions
6. Wait for patient...

### On Other Device (Patient):
**Make sure it's on the SAME WiFi network!**

1. Open browser: `http://10.20.18.252:3000`
2. Login as patient
3. Go to "My Appointments"
4. Click "Join Call" on the SAME appointment
5. Allow camera/microphone permissions
6. Connection should establish in 5-10 seconds

## Supported Devices

✅ **Laptops/Desktops** - Any browser (Chrome/Edge recommended)
✅ **Android Phones/Tablets** - Chrome browser
✅ **iPhones/iPads** - Safari browser
✅ **Any device with camera and browser**

## Troubleshooting

### Can't access from other device?

1. **Check WiFi** - Both devices must be on the same network
2. **Run as Administrator** - Right-click `ALLOW_FIREWALL.bat` → Run as Administrator
3. **Test connection** - From other device, try opening: `http://10.20.18.252:8000/docs`

### No video/audio?

1. **Check permissions** - Browser should ask for camera/microphone access
2. **Try different browser** - Chrome/Edge work best
3. **Check camera** - Make sure no other app is using it

### Connection fails?

1. **Check backend logs** - Should see WebSocket connections
2. **Refresh both pages** - Sometimes helps
3. **Try different appointment** - Use a fresh appointment ID

## What You Should See

**Doctor's Screen:**
- Your own video (mirrored)
- Patient's video (when connected)
- Green "Connected" indicator
- Working controls (mute, video toggle, end call)

**Patient's Screen:**
- Your own video (mirrored)
- Doctor's video (when connected)
- Green "Connected" indicator
- Working controls (mute, video toggle, end call)

## Console Logs (Press F12)

**Doctor should see:**
```
✅ Local media obtained
✅ Signaling connected as doctor
👤 patient joined (2 total)
📤 Creating offer...
✅ Offer sent successfully
📥 Received answer
🔗 Connection state: connected
📹 Received remote track
```

**Patient should see:**
```
✅ Local media obtained
✅ Signaling connected as patient
📥 Received offer, creating answer...
✅ Answer sent successfully
🔗 Connection state: connected
📹 Received remote track
```

## Tips

- **Doctor should join first** - Makes connection faster
- **Same appointment ID** - Both must join the same appointment
- **Good internet** - WiFi should be stable
- **Close other apps** - Free up camera/bandwidth
- **Use headphones** - Prevents echo

## Need Help?

Check the detailed guide: `TEST_DIFFERENT_DEVICES.md`
