# WebSocket Integration Complete

## What Was Implemented

### Backend (Node.js Server)

**File: `server/src/server.js`**
- Added Socket.IO server with CORS configuration
- Created HTTP server wrapping Express app
- Implemented real-time event handlers:
  - `request_emotion` - Triggers emotion detection on Raspberry Pi
  - `request_camera_frame` - Fetches camera frame from Raspberry Pi
  - `request_music_status` - Gets current music playback status
  - `request_device_status` - Checks Raspberry Pi connection and capabilities
- Proxies requests between React frontend and Raspberry Pi Flask server
- Error handling for connection failures

**Packages Installed:**
- `socket.io` - WebSocket server
- `axios` - HTTP client for Raspberry Pi communication

**Environment Variable:**
- `RASPBERRY_PI_URL` - Flask server URL (default: http://raspberrypi.local:5000)

### Frontend (React Dashboard)

**File: `src/proto/prototype.jsx`**
Complete rewrite with real-time functionality:
- Socket.IO client connection to Node.js server
- State management for:
  - Device status (connected, deviceId, lastActive, firmware)
  - System status (camera, emotion detection, servo)
  - Current emotion and emotion logs (last 10)
  - Music playback status
  - Camera feed (live images)
  - Error messages
- Real-time updates:
  - Camera frames: Every 2 seconds
  - Music status: Every 2 seconds
  - Device status: Every 10 seconds
- Manual "Detect Emotion" button for on-demand detection
- Automatic cleanup on component unmount

**File: `src/proto/prototype.css`**
Added styles for:
- Error banner with animation
- Camera feed display
- "Detect Emotion" button
- Current emotion display with gradient
- Music status indicator
- Emotion logs with scrollable list
- Status badges (online/offline, active/inactive)
- Custom scrollbar for logs
- Responsive layout
- Hover effects and transitions

**File: `src/backend/dashboards/userdash/userdash.jsx`**
- Added "Prototype" panel button to dashboard
- Changed panel click handler to route to prototype instead of system
- Panel description: "EMO device monitoring and control"

## Features

### 1. Device Status Monitoring
- Shows connection status (Online/Offline)
- Displays device ID, last active time, and firmware version
- Real-time status updates every 10 seconds

### 2. System Status Display
- Camera: Active/Inactive indicator
- Emotion Detection: Active/Inactive indicator
- Servo Control: Active/Inactive indicator
- Current emotion display (when detected)
- Music playback status with song name and emotion

### 3. Live Camera Feed
- Updates every 2 seconds
- Shows real-time view from Raspberry Pi camera
- Displays "Camera offline" when not connected
- Clean placeholder when no feed available

### 4. Emotion Detection
- Manual trigger via "Detect Emotion" button
- Displays detected emotion with confidence percentage
- Shows servo angle position
- Timestamp for each detection
- Automatic music playback based on emotion

### 5. Emotion Logs
- Keeps history of last 10 detections
- Shows emotion, confidence, timestamp, and servo angle
- Scrollable list with custom styled scrollbar
- Color-coded confidence levels
- Hover effects for better UX

### 6. Error Handling
- Connection error display
- Device offline notification
- Camera/music error messages
- Graceful degradation when Raspberry Pi is unreachable

## Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌───────────────────┐
│  React Frontend │◄───────►│  Node.js Server  │◄───────►│  Raspberry Pi 4   │
│  (port 5173)    │ Socket  │  (port 4000)     │  HTTP   │  Flask (port 5000)│
│                 │  .IO    │                  │         │                   │
│  - prototype.jsx│         │  - server.js     │         │  - emotion_server │
│  - Socket.IO    │         │  - Socket.IO     │         │  - Camera         │
│    client       │         │  - Axios proxy   │         │  - Servo motor    │
│                 │         │                  │         │  - Music player   │
└─────────────────┘         └──────────────────┘         └───────────────────┘
```

## Event Flow

### Device Status Check
1. Frontend emits `request_device_status`
2. Node.js server calls Raspberry Pi `/api/status`
3. Response sent back via `device_status` event
4. Frontend updates UI with connection status

### Emotion Detection
1. User clicks "Detect Emotion" button
2. Frontend emits `request_emotion`
3. Node.js server calls Raspberry Pi `/api/detect_emotion`
4. Raspberry Pi:
   - Captures camera frame
   - Runs emotion detection model
   - Moves servo to corresponding angle
   - Plays music for detected emotion
5. Response sent via `emotion_result` event
6. Frontend updates emotion logs and displays result

### Camera Feed
1. Automatic polling every 2 seconds
2. Frontend emits `request_camera_frame`
3. Node.js server calls Raspberry Pi `/api/camera_frame`
4. Image encoded as base64 and sent via `camera_frame` event
5. Frontend displays image in camera panel

### Music Status
1. Automatic polling every 2 seconds
2. Frontend emits `request_music_status`
3. Node.js server calls Raspberry Pi `/api/music_status`
4. Response sent via `music_status` event
5. Frontend displays current song and emotion

## Next Steps

### To Complete Integration:

1. **Set up Raspberry Pi Flask server**
   - Follow instructions in `RASPBERRY_PI_SETUP.md`
   - Install required Python packages
   - Connect camera module
   - Wire servo motor to GPIO 18
   - Add music files to `/home/pi/music/`

2. **Train or Download Emotion Recognition Model**
   - Use FER-2013 or AffectNet dataset
   - Train with TensorFlow/Keras
   - Or download pre-trained model
   - Update `detect_emotion()` function in Flask server

3. **Configure Network**
   - Ensure Raspberry Pi is on same network
   - Get Raspberry Pi IP address: `hostname -I`
   - Update `server/.env`: `RASPBERRY_PI_URL=http://YOUR_PI_IP:5000`

4. **Test Connection**
   - Start Flask server on Raspberry Pi
   - Start Node.js backend: `cd server && npm run dev`
   - Start React frontend: `npm run dev`
   - Open User Dashboard > Prototype panel
   - Verify device shows "Online"

## Files Modified/Created

### Modified:
- `server/src/server.js` - Added Socket.IO server
- `src/proto/prototype.jsx` - Complete rewrite with real-time features
- `src/proto/prototype.css` - Added new styles for features
- `src/backend/dashboards/userdash/userdash.jsx` - Added prototype panel

### Created:
- `RASPBERRY_PI_SETUP.md` - Complete setup guide for Flask server
- `INTEGRATION_SUMMARY.md` - This file

### Packages Installed:
- Backend: `socket.io`, `axios`
- Frontend: `socket.io-client` (already installed)

## Testing Checklist

- [ ] Backend server starts without errors
- [ ] Socket.IO connection established (check browser console)
- [ ] Device status shows "Offline" when Pi not running
- [ ] Device status shows "Online" when Pi connected
- [ ] Camera feed updates automatically
- [ ] "Detect Emotion" button triggers detection
- [ ] Emotion logs display correctly
- [ ] Music status shows when playing
- [ ] Error messages display when connection fails
- [ ] Automatic reconnection works after disconnect

## Known Limitations

1. **Camera feed latency**: 2-second polling interval means ~2s delay
   - Can be reduced by adjusting interval in prototype.jsx
   - Consider using video streaming for real-time feed

2. **No video streaming**: Currently uses image frames
   - Could implement MJPEG stream for smoother video
   - Or use WebRTC for real-time video

3. **Single client**: Multiple users will trigger multiple requests
   - Consider implementing request queuing on Flask server
   - Or add rate limiting

4. **Emotion model placeholder**: Need to integrate actual model
   - Currently returns mock "happy" emotion
   - Replace with trained TensorFlow/Keras model

## Performance Optimization Ideas

1. Implement server-side caching for camera frames
2. Use WebRTC for lower latency video streaming
3. Implement request debouncing on frontend
4. Add Socket.IO rooms for multi-user support
5. Compress camera frames before transmission
6. Implement frame skipping during high load

## Security Considerations

1. Add authentication for Socket.IO connections
2. Validate requests before proxying to Raspberry Pi
3. Implement rate limiting on endpoints
4. Use HTTPS/WSS in production
5. Add CORS restrictions for production environment
6. Sanitize error messages to avoid information leakage
