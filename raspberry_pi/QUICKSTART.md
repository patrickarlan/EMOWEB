# 🚀 Quick Start Guide - Raspberry Pi Integration

## What You Have

✅ Flask server ready: `emotion_flask_server.py`  
✅ Integration template: `INTEGRATION_TEMPLATE.py`  
✅ Your emotion code: `emoweb.py` (with imports added)

## What You Need To Do

### Step 1: Add Required Functions to emoweb.py

Open your `emoweb.py` and add these 3 functions:

```python
def initialize_camera():
    """Initialize camera - return camera object"""
    camera = cv2.VideoCapture(0)
    camera.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    return camera

def initialize_hardware():
    """Initialize servos, OLED, Arduino, etc."""
    # Your existing hardware setup code goes here
    pass

def detect_emotion_from_frame(frame):
    """Detect emotion from frame - return dict with emotion, confidence, servoAngle"""
    # Use your existing emotion detection code here
    # Return format:
    return {
        'emotion': 'happy',       # Your detected emotion
        'confidence': 95.5,       # Your confidence score
        'servoAngle': 180         # Servo angle for this emotion
    }
```

See `INTEGRATION_TEMPLATE.py` for detailed examples.

### Step 2: Upload to Raspberry Pi

Upload these 2 files to your Raspberry Pi (same directory):
- `emotion_flask_server.py`
- `emoweb.py`

### Step 3: Install Flask on Raspberry Pi

```bash
pip3 install flask flask-cors opencv-python numpy
```

### Step 4: Run Flask Server on Raspberry Pi

```bash
python3 emotion_flask_server.py
```

You should see:
```
✓ System initialized successfully
✓ Server starting on port 5000
📡 Server URL: http://0.0.0.0:5000
```

### Step 5: Get Your Raspberry Pi IP Address

On Raspberry Pi, run:
```bash
hostname -I
```

Example output: `192.168.1.100`

### Step 6: Update Your Windows .env File

On your Windows machine, create/edit `server/.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=12345
DB_NAME=emoweb
PORT=4000
CORS_ORIGIN=
JWT_SECRET=please-change-this-secret
JWT_EXPIRES=7d
SUPER_ADMIN_USERNAME=superadmin
SUPER_ADMIN_EMAIL=admin@emoweb.com
SUPER_ADMIN_PASSWORD=SuperSecureAdmin123!

# Add this line with YOUR Raspberry Pi IP:
RASPBERRY_PI_URL=http://192.168.1.100:5000
```

Replace `192.168.1.100` with your actual Pi IP.

### Step 7: Start Your EMOWEB System

**On Windows (in VS Code terminal):**

Terminal 1 - Backend:
```powershell
cd server
npm run dev
```

Terminal 2 - Frontend:
```powershell
npm run dev
```

### Step 8: Test the Connection

1. Open browser: `http://localhost:5173`
2. Login to your account
3. Go to User Dashboard
4. Click on "Prototype" panel
5. You should see:
   - ✅ Device Status: **Online**
   - ✅ Live camera feed
   - ✅ System Status: All green
   - ✅ Click "Detect Emotion" button to test

## Troubleshooting

### ❌ Device shows "Offline"

**Check:**
- Is Flask server running on Raspberry Pi?
- Is `RASPBERRY_PI_URL` correct in `server/.env`?
- Are Raspberry Pi and Windows on same network?

**Test connection:**
```powershell
# On Windows, test if you can reach the Pi:
curl http://192.168.1.100:5000/api/status
```

### ❌ "Module not found" error on Raspberry Pi

**Check:**
- Both files in same directory?
- Run `ls -l` to verify

### ❌ Camera not working

**On Raspberry Pi:**
```bash
# Test camera
raspistill -o test.jpg

# Enable camera if needed
sudo raspi-config
# Interface Options → Camera → Enable
```

## Architecture Overview

```
┌─────────────────┐
│   Browser       │
│  (localhost:    │
│    5173)        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  React Frontend │
│  prototype.jsx  │
└────────┬────────┘
         │ Socket.IO
         ▼
┌─────────────────┐
│  Node.js Server │
│   (port 4000)   │
└────────┬────────┘
         │ HTTP Requests
         ▼
┌─────────────────┐
│  Raspberry Pi   │
│  Flask Server   │
│   (port 5000)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    emoweb.py    │
│ Emotion Detect  │
│ Camera, Servo   │
│ OLED, Arduino   │
└─────────────────┘
```

## Test Checklist

- [ ] Raspberry Pi Flask server running
- [ ] Can access `http://pi-ip:5000/api/status` from Windows
- [ ] `server/.env` has correct `RASPBERRY_PI_URL`
- [ ] Node.js backend running (port 4000)
- [ ] React frontend running (port 5173)
- [ ] Prototype panel shows "Online"
- [ ] Camera feed visible
- [ ] "Detect Emotion" button works
- [ ] Emotion logs appear after detection

## Next Steps

Once everything works:
- Integrate your TFLite model in `detect_emotion_from_frame()`
- Add servo control logic
- Add OLED display updates
- Add music playback functionality
- Test different emotions

## Need Help?

Check the detailed guides:
- `README.md` - Full setup instructions
- `INTEGRATION_TEMPLATE.py` - Code examples
- Console logs for error messages
