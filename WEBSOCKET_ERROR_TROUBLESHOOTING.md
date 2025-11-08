# WebSocket Signaling Error Troubleshooting

## Error: "❌ Signaling error: {}"

This error occurs when the WebSocket connection to the signaling server fails. The error object is often empty because WebSocket errors don't always provide detailed information.

## Common Causes & Solutions

### 1. Backend Server Not Running

**Symptom**: Error appears immediately when trying to start a video call

**Solution**:
```bash
# Navigate to backend directory
cd backend

# Start the backend server
python run.py
# OR
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Verify**: Check that the backend is running by visiting `http://localhost:8000/docs` in your browser

### 2. Incorrect Backend URL Configuration

**Symptom**: Error shows "Invalid WebSocket URL" or URL contains "undefined"

**Solution**:
1. Check your `.env` file in the `frontend` directory:
   ```env
   NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
   ```

2. If using a different port or domain, update accordingly:
   ```env
   NEXT_PUBLIC_BACKEND_URL=http://your-backend-url:8000
   ```

3. Restart the Next.js dev server after changing environment variables:
   ```bash
   # Stop the server (Ctrl+C)
   # Then restart
   npm run dev
   ```

### 3. CORS Issues

**Symptom**: Connection fails with network errors in browser console

**Solution**: Ensure the backend has CORS configured properly. Check `backend/app/main.py`:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Add your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 4. WebSocket URL Construction Issue

**Symptom**: URL looks incorrect in console logs

**Check**: The console should show:
```
🔌 Connecting to signaling server: ws://localhost:8000/ws/signaling/{consultationId}/{userType}
```

If it shows `ws://undefined` or similar, the `NEXT_PUBLIC_BACKEND_URL` is not set correctly.

### 5. Port Already in Use

**Symptom**: Backend fails to start or WebSocket connection refused

**Solution**:
1. Check if port 8000 is already in use:
   ```bash
   # Windows
   netstat -ano | findstr :8000
   
   # Linux/Mac
   lsof -i :8000
   ```

2. Either stop the process using the port or change the backend port:
   ```python
   # In run.py or main.py
   uvicorn.run(app, host="0.0.0.0", port=8001)  # Use different port
   ```

3. Update frontend `.env` to match:
   ```env
   NEXT_PUBLIC_BACKEND_URL=http://localhost:8001
   ```

### 6. Network/Firewall Issues

**Symptom**: Connection works locally but fails on network

**Solution**:
1. Check Windows Firewall settings
2. Ensure backend is bound to `0.0.0.0` not just `127.0.0.1`:
   ```python
   uvicorn.run(app, host="0.0.0.0", port=8000)
   ```

3. For network access, use your machine's IP address:
   ```env
   NEXT_PUBLIC_BACKEND_URL=http://192.168.1.XXX:8000
   ```

### 7. HTTPS/WSS Mismatch

**Symptom**: Connection fails when using HTTPS frontend with HTTP backend

**Solution**: 
- Use `wss://` for secure WebSocket connections
- Or ensure both use HTTP/WS

## Debugging Steps

1. **Check Browser Console**: Look for detailed error messages
   - Open DevTools (F12)
   - Go to Console tab
   - Look for WebSocket connection logs

2. **Check Backend Logs**: 
   - Look for WebSocket connection attempts
   - Check for any errors in the backend terminal

3. **Test WebSocket Connection Manually**:
   ```javascript
   // In browser console
   const ws = new WebSocket('ws://localhost:8000/ws/signaling/test-room/doctor')
   ws.onopen = () => console.log('Connected!')
   ws.onerror = (e) => console.error('Error:', e)
   ws.onclose = (e) => console.log('Closed:', e.code, e.reason)
   ```

4. **Verify Backend Endpoint**:
   - Visit `http://localhost:8000/docs` in browser
   - Check if WebSocket endpoints are listed
   - Try connecting via the Swagger UI

## Improved Error Messages

The updated code now provides more detailed error information:

- **Connection State**: Shows WebSocket ready state
- **URL Validation**: Checks if backend URL is properly configured
- **Specific Error Codes**: 
  - `1006`: Abnormal closure (network issue)
  - `1000`: Normal closure (clean disconnect)

## Quick Fix Checklist

- [ ] Backend server is running
- [ ] `NEXT_PUBLIC_BACKEND_URL` is set in `.env`
- [ ] Frontend dev server restarted after `.env` changes
- [ ] Port 8000 is not blocked by firewall
- [ ] CORS is configured correctly
- [ ] No other process is using port 8000
- [ ] Backend is accessible at the configured URL

## Still Having Issues?

1. Check the browser Network tab for WebSocket connection attempts
2. Review backend logs for any exceptions
3. Try connecting from a different browser/device
4. Verify all dependencies are installed:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

