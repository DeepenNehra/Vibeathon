# Testing Video Call on Different Devices

## Step 1: Find Your Computer's IP Address

**On Windows (your current system):**
```cmd
ipconfig
```
Look for "IPv4 Address" under your WiFi/Ethernet adapter (e.g., `192.168.1.5`)

## Step 2: Update Backend URL

Edit `frontend/.env.local` and replace `localhost` with your IP:
```
NEXT_PUBLIC_BACKEND_URL=http://YOUR_IP:8000
```

Example:
```
NEXT_PUBLIC_BACKEND_URL=http://192.168.1.5:8000
```

## Step 3: Start Backend Server (Allow Network Access)

```cmd
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The `--host 0.0.0.0` allows connections from other devices on your network.

## Step 4: Start Frontend

```cmd
cd frontend
npm run dev
```

## Step 5: Test on Different Devices

### Device 1 (Doctor - e.g., Your Laptop):
1. Open browser: `http://localhost:3000`
2. Login as doctor
3. Go to "My Appointments"
4. Click "Join Call" on any appointment

### Device 2 (Patient - e.g., Phone/Tablet/Another Laptop):
1. **Make sure both devices are on the SAME WiFi network**
2. Open browser: `http://YOUR_IP:3000` (e.g., `http://192.168.1.5:3000`)
3. Login as patient
4. Go to "My Appointments"
5. Click "Join Call" on the SAME appointment

## Expected Result

- Both devices should see each other's video
- Audio should work both ways
- Connection should establish in 5-10 seconds

## Troubleshooting

### Can't access from other device?

**Check Windows Firewall:**
```cmd
netsh advfirewall firewall add rule name="Node Dev Server" dir=in action=allow protocol=TCP localport=3000
netsh advfirewall firewall add rule name="Backend API" dir=in action=allow protocol=TCP localport=8000
```

Or run the existing batch file:
```cmd
ALLOW_FIREWALL.bat
```

### Still not working?

1. **Verify both devices on same WiFi** - Check WiFi name on both
2. **Ping test** - From other device, try: `ping YOUR_IP`
3. **Try different browser** - Chrome/Edge work best for WebRTC
4. **Check backend logs** - Should see WebSocket connections from both devices

## Mobile Testing

Works on mobile browsers:
- **Android**: Chrome browser
- **iOS**: Safari browser

Just open `http://YOUR_IP:3000` in the mobile browser.

## Network Requirements

- Both devices must be on the **same WiFi network**
- For devices on different networks, you'll need a TURN server (more complex setup)
- Current setup uses Google's STUN servers for NAT traversal

## Quick Commands

**Get your IP:**
```cmd
ipconfig | findstr IPv4
```

**Start everything:**
```cmd
# Terminal 1 - Backend
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 - Frontend
cd frontend
npm run dev
```

**Allow firewall (run as Administrator):**
```cmd
ALLOW_FIREWALL.bat
```
