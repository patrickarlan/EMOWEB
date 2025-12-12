# Quick Start Guide - Raspberry Pi Emotion Recognition Integration

## Overview
Your EMOWEB dashboard is now ready to connect to your Raspberry Pi 4 emotion recognition system! This guide will help you get everything running.

## What's Already Done ✅

### Backend (Node.js Server)
- ✅ Socket.IO server installed and configured
- ✅ WebSocket event handlers for emotion detection
- ✅ Proxy communication with Raspberry Pi
- ✅ Real-time camera frame streaming
- ✅ Music status monitoring

### Frontend (React Dashboard)
- ✅ Socket.IO client connection
- ✅ Prototype panel added to User Dashboard
- ✅ Live camera feed display
- ✅ Emotion detection logs
- ✅ Music playback status
- ✅ Device status monitoring
- ✅ Error handling and offline detection

## Quick Start Steps

### 1. Start Your Servers

**Terminal 1 - Backend Server:**
```powershell
cd c:\Users\HP\Documents\EMOWEB\server
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd c:\Users\HP\Documents\EMOWEB
npm run dev
```

### 2. Access the Dashboard

1. Open browser to: `http://localhost:5173`
2. Log in to your account
3. Go to User Dashboard
4. Click on the **"Prototype"** panel

### 3. What You'll See (Without Raspberry Pi)

**Status: Offline** 🔴
- Device Overview: Shows "Offline"
- Camera: Inactive
- Emotion Detection: Inactive
- Servo Control: Inactive
- Error message: "Device offline or unreachable"

This is normal! The system is waiting for your Raspberry Pi connection.

### 4. Set Up Raspberry Pi (Next Step)

Follow the complete guide in `RASPBERRY_PI_SETUP.md` to:
1. Install Python packages on Raspberry Pi
2. Set up camera module
3. Wire servo motor
4. Add music files
5. Run Flask server
6. Connect to your dashboard

### 5. What You'll See (With Raspberry Pi Connected)

**Status: Online** 🟢
- Device Overview: Shows "Online" with device ID
- Live camera feed updating every 2 seconds
- Real-time system status indicators
- "Detect Emotion" button active
- Emotion logs showing detection history
- Music playback status

## Features Available Now

### Device Monitoring
- **Online/Offline Status**: Real-time connection indicator
- **Device Info**: ID, last active time, firmware version
- **System Health**: Camera, emotion detection, servo status

### Camera Feed
- **Live Video**: Updates every 2 seconds
- **High Quality**: 640x480 JPEG frames
- **Automatic Refresh**: No manual intervention needed

### Emotion Detection
- **Manual Trigger**: Click "Detect Emotion" button
- **Results Display**: Shows emotion with confidence %
- **History Log**: Last 10 detections saved
- **Servo Feedback**: Shows servo angle for each emotion

### Music Integration
- **Auto-Play**: Music starts based on detected emotion
- **Status Display**: Shows current song and emotion
- **Real-Time**: Updates every 2 seconds

## Testing Without Raspberry Pi

The dashboard works perfectly even without Raspberry Pi connected:
- Shows offline status gracefully
- No crashes or errors
- Ready to connect when device is available
- All UI elements visible and styled

## Environment Configuration

Add to `server/.env` when Raspberry Pi is ready:

```env
# Raspberry Pi Configuration
RASPBERRY_PI_URL=http://raspberrypi.local:5000
# Or use IP address:
# RASPBERRY_PI_URL=http://192.168.1.100:5000
```

## Troubleshooting

### Dashboard Shows "Offline"
✅ This is expected without Raspberry Pi
- No action needed
- Connect Pi to see "Online" status

### Socket.IO Connection Error
Check browser console (F12):
- Should see: "Connected to Socket.IO server"
- If not, restart backend server

### "Detect Emotion" Button Disabled
- Normal when device is offline
- Will enable automatically when Pi connects

### No Camera Feed
- Verify Raspberry Pi is running
- Check RASPBERRY_PI_URL in .env
- Ensure Pi and PC on same network

## Architecture

```
Your Computer:
├── React Frontend (localhost:5173)
│   └── Prototype Panel (Real-time UI)
└── Node.js Backend (localhost:4000)
    └── Socket.IO Server (WebSocket proxy)

Raspberry Pi 4:
└── Python Flask Server (port 5000)
    ├── Camera Module
    ├── Emotion Detection Model
    ├── Servo Motor Control
    └── Music Player
```

## Next Steps

1. **Test Current Setup** ✅
   - Start both servers
   - View Prototype panel
   - Verify offline status displays correctly

2. **Prepare Raspberry Pi**
   - Read `RASPBERRY_PI_SETUP.md`
   - Install required packages
   - Set up hardware (camera + servo)

3. **Connect Everything**
   - Start Flask server on Pi
   - Update RASPBERRY_PI_URL in .env
   - Restart backend server
   - Watch status change to "Online"

4. **Start Using**
   - Click "Detect Emotion"
   - View camera feed
   - Check emotion logs
   - Monitor music playback

## Support Files

- `RASPBERRY_PI_SETUP.md` - Complete Pi setup guide
- `INTEGRATION_SUMMARY.md` - Technical implementation details
- `server/.env.example` - Environment variables reference

## Demo Mode

Want to test without hardware? You can modify the Flask server to return mock data:
- Mock camera frames (use test images)
- Random emotion results
- Simulated servo movements
- Test music files

See `RASPBERRY_PI_SETUP.md` for mock server implementation.

## Success Criteria

### ✅ Frontend Working
- [x] Prototype panel visible in dashboard
- [x] Socket.IO client connects to backend
- [x] Offline status displays correctly
- [x] UI styled and responsive
- [x] No console errors

### ⏳ Raspberry Pi Integration (Next)
- [ ] Flask server running on Pi
- [ ] Camera module working
- [ ] Servo motor responsive
- [ ] Music files loaded
- [ ] Dashboard shows "Online"
- [ ] Emotion detection functional
- [ ] Camera feed streaming
- [ ] Music plays on emotion detection

## Have Questions?

Check these resources:
1. Browser console (F12) for frontend errors
2. Backend terminal for server logs
3. `INTEGRATION_SUMMARY.md` for architecture details
4. `RASPBERRY_PI_SETUP.md` for Pi configuration

## Current Status: ✅ Ready for Raspberry Pi Connection

Your dashboard is fully functional and waiting for the Raspberry Pi device to connect. Everything on the web application side is complete!
