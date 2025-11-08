# Fix "Camera Already in Use" Error

## Quick Solution (Most Common Fix)

### Step 1: Close All Video Apps
Close these applications completely (not just minimize):
- **Zoom**
- **Microsoft Teams**
- **Skype**
- **Discord**
- **Google Meet** (if open in browser)
- **Any screen recording software** (OBS, Streamlabs, etc.)
- **Windows Camera app**
- **Any other video conferencing apps**

### Step 2: Close Other Browser Tabs
1. Look for browser tabs with video calls (you'll see a camera icon in the tab)
2. Close ALL tabs with video calls
3. Keep only the consultation room tab open

### Step 3: Check Windows Camera Privacy
1. Press `Win + I` to open Settings
2. Go to **Privacy & Security** → **Camera**
3. Make sure **"Camera access"** is **ON**
4. Make sure **"Let apps access your camera"** is **ON**
5. Make sure **"Let desktop apps access your camera"** is **ON**

### Step 4: Restart Browser
1. Close ALL browser windows completely
2. Wait 5 seconds
3. Reopen browser
4. Navigate back to the consultation room

### Step 5: Try Again
Click the **"Retry Camera Access"** button in the error message

---

## Detailed Troubleshooting

### Method 1: Check What's Using Camera (Windows)

1. **Open Task Manager**:
   - Press `Ctrl + Shift + Esc`
   - Or right-click taskbar → Task Manager

2. **Look for these processes** (end them if found):
   - `Zoom.exe`
   - `Teams.exe` or `ms-teams.exe`
   - `Skype.exe`
   - `Discord.exe`
   - `obs64.exe` or `obs32.exe` (OBS Studio)
   - `Camera.exe` (Windows Camera)
   - Any browser processes you're not using

3. **End the processes**:
   - Right-click on the process
   - Click "End task"

### Method 2: Check Browser Permissions

**Chrome/Edge:**
1. Click the **lock icon** (🔒) in the address bar
2. Find **Camera** → Set to **Allow**
3. Find **Microphone** → Set to **Allow**
4. Refresh the page

**Firefox:**
1. Click the **shield icon** in address bar
2. Click **Permissions** → **Camera** → **Allow**
3. Do the same for **Microphone**
4. Refresh the page

### Method 3: Reset Camera Permissions

**Chrome/Edge:**
1. Go to `chrome://settings/content/camera` (or `edge://settings/content/camera`)
2. Find your site in the list
3. Click the **trash icon** to remove
4. Refresh the page and allow permissions again

### Method 4: Check Windows Camera App

1. Open **Windows Camera** app
2. If it opens and shows your camera, close it
3. This releases the camera for other apps

### Method 5: Restart Camera Service (Advanced)

1. Press `Win + R`
2. Type `services.msc` and press Enter
3. Find **"Windows Camera Frame Server"**
4. Right-click → **Restart**
5. Wait 10 seconds
6. Try again

### Method 6: Check Device Manager

1. Press `Win + X` → **Device Manager**
2. Expand **"Cameras"** or **"Imaging devices"**
3. Right-click your camera → **Disable**
4. Wait 5 seconds
5. Right-click again → **Enable**
6. Try again

---

## Still Not Working?

### Option A: Use Different Browser
Try opening the consultation in a different browser:
- If using Chrome, try Edge
- If using Edge, try Chrome
- If using Firefox, try Chrome or Edge

### Option B: Restart Computer
Sometimes a full restart is needed to release camera resources:
1. Save your work
2. Restart your computer
3. Open only the consultation room (no other apps)
4. Try again

### Option C: Check Antivirus
Some antivirus software blocks camera access:
1. Temporarily disable antivirus
2. Try accessing camera
3. If it works, add browser to antivirus exceptions

---

## Prevention Tips

1. **Always close video apps** before joining a consultation
2. **Close other browser tabs** with video calls
3. **Don't open Windows Camera app** while in a consultation
4. **Check Task Manager** if you're unsure what's using the camera

---

## Quick Checklist

Before joining a consultation:
- [ ] Closed Zoom/Teams/Skype/Discord
- [ ] Closed other browser tabs with video
- [ ] Closed Windows Camera app
- [ ] Checked browser permissions (lock icon)
- [ ] Checked Windows privacy settings
- [ ] Restarted browser if needed

---

## Need More Help?

If none of these work:
1. Check the browser console (F12) for detailed error messages
2. Try a different browser
3. Restart your computer
4. Check if camera works in Windows Camera app (if not, it's a hardware/driver issue)

