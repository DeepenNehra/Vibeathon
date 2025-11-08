# Camera/Microphone Error Troubleshooting

## Error: "NotReadableError: Could not start video source"

This error occurs when the browser cannot access your camera or microphone. Here are the most common causes and solutions:

## Common Causes & Solutions

### 1. Camera/Microphone Already in Use

**Symptom**: Error appears immediately when trying to join a call

**Solution**:
1. **Close other applications** using the camera:
   - Zoom, Teams, Skype, Discord
   - Other browser tabs with video calls
   - Camera apps (Windows Camera, Photo Booth, etc.)
   - Screen recording software

2. **Check Windows Camera Privacy Settings**:
   - Go to Settings → Privacy → Camera
   - Ensure "Allow apps to access your camera" is ON
   - Ensure "Allow desktop apps to access your camera" is ON

3. **Restart your browser** after closing other apps

### 2. Browser Permissions Denied

**Symptom**: Browser shows permission prompt but access is denied

**Solution**:

**Chrome/Edge**:
1. Click the lock icon (🔒) in the address bar
2. Find "Camera" and "Microphone" permissions
3. Set both to "Allow"
4. Refresh the page

**Firefox**:
1. Click the shield icon in the address bar
2. Click "Permissions" → "Camera" → "Allow"
3. Do the same for "Microphone"
4. Refresh the page

**Safari**:
1. Safari → Settings → Websites → Camera
2. Find your site and set to "Allow"
3. Do the same for Microphone
4. Refresh the page

### 3. Hardware Not Connected

**Symptom**: "No camera or microphone found" error

**Solution**:
1. **Check physical connections**:
   - Ensure USB camera is plugged in
   - Check USB cable for damage
   - Try a different USB port

2. **Check device manager** (Windows):
   - Press `Win + X` → Device Manager
   - Look for "Imaging devices" or "Cameras"
   - If camera shows with yellow warning, update drivers

3. **Test camera in another app**:
   - Open Windows Camera app
   - If it works there, the issue is browser-specific
   - If it doesn't work, it's a hardware/driver issue

### 4. Driver Issues

**Symptom**: Camera not detected or shows errors in Device Manager

**Solution**:
1. **Update camera drivers**:
   - Right-click camera in Device Manager
   - Select "Update driver"
   - Choose "Search automatically"

2. **Reinstall camera drivers**:
   - Uninstall camera from Device Manager
   - Restart computer
   - Windows will reinstall drivers automatically

3. **Check manufacturer website** for latest drivers

### 5. Browser Settings Blocking Access

**Symptom**: Permissions seem correct but still getting errors

**Solution**:

**Chrome**:
1. Go to `chrome://settings/content/camera`
2. Ensure site is not blocked
3. Go to `chrome://settings/content/microphone`
4. Ensure site is not blocked

**Edge**:
1. Go to `edge://settings/content/camera`
2. Ensure site is not blocked
3. Go to `edge://settings/content/microphone`
4. Ensure site is not blocked

### 6. Multiple Browser Tabs

**Symptom**: Works in one tab but not another

**Solution**:
- **Close all other tabs** with video calls
- Browsers typically allow only one tab to access camera at a time
- Refresh the page after closing other tabs

### 7. Antivirus/Security Software Blocking

**Symptom**: Everything seems correct but still fails

**Solution**:
1. **Check antivirus settings**:
   - Temporarily disable antivirus
   - Try accessing camera again
   - If it works, add browser to antivirus exceptions

2. **Check Windows Defender**:
   - Windows Security → App & browser control
   - Ensure camera access is not blocked

### 8. HTTPS Required

**Symptom**: Works on localhost but not on network

**Solution**:
- Modern browsers require HTTPS for camera access (except localhost)
- Ensure you're using HTTPS in production
- For development, use `http://localhost` (not IP address)

## Quick Fix Checklist

- [ ] Closed all other apps using camera (Zoom, Teams, etc.)
- [ ] Closed other browser tabs with video calls
- [ ] Granted camera/microphone permissions in browser
- [ ] Checked Windows privacy settings for camera access
- [ ] Tested camera in Windows Camera app
- [ ] Updated camera drivers
- [ ] Restarted browser
- [ ] Restarted computer (if nothing else works)

## Testing Camera Access

1. **Test in Windows Camera app**:
   - If it works here, issue is browser-related
   - If it doesn't work, issue is hardware/driver-related

2. **Test in browser**:
   ```javascript
   // Open browser console (F12) and run:
   navigator.mediaDevices.getUserMedia({ video: true, audio: true })
     .then(stream => {
       console.log('✅ Camera works!', stream)
       stream.getTracks().forEach(track => track.stop())
     })
     .catch(err => {
       console.error('❌ Camera error:', err.name, err.message)
     })
   ```

3. **Check available devices**:
   ```javascript
   navigator.mediaDevices.enumerateDevices()
     .then(devices => {
       const cameras = devices.filter(d => d.kind === 'videoinput')
       console.log('Available cameras:', cameras)
     })
   ```

## Error Messages Explained

- **NotReadableError**: Camera is in use by another app
- **NotAllowedError**: Permission denied by user
- **NotFoundError**: No camera found
- **OverconstrainedError**: Camera doesn't support requested settings
- **TrackStartError**: Camera failed to start (usually hardware issue)

## Still Having Issues?

1. **Check browser console** for detailed error messages
2. **Try a different browser** to isolate the issue
3. **Try a different camera** if available
4. **Check Windows Event Viewer** for hardware errors:
   - Press `Win + X` → Event Viewer
   - Look for errors related to camera

5. **Contact support** with:
   - Browser name and version
   - Operating system
   - Camera model
   - Exact error message from console

