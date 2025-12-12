# Raspberry Pi Setup for EMOWEB

This directory contains the Flask server that runs on your Raspberry Pi 4 to connect your emotion detection hardware with the EMOWEB dashboard.

## Files

- **emotion_flask_server.py** - Main Flask server (upload this to your Pi)
- **emoweb.py** - Your emotion detection code (your existing file)

## Quick Start

### 1. On Your Raspberry Pi

```bash
# Install required packages
sudo apt-get update
sudo apt-get install python3-pip python3-opencv
pip3 install flask flask-cors opencv-python numpy

# If using TensorFlow Lite
pip3 install tflite-runtime

# If using pigpio
sudo apt-get install pigpio python3-pigpio
```

### 2. Upload Files to Raspberry Pi

Upload both files to the same directory on your Pi (e.g., `/home/pi/emoweb/`):
- `emotion_flask_server.py`
- `emoweb.py`

### 3. Run the Server

```bash
cd /home/pi/emoweb/
python3 emotion_flask_server.py
```

You should see:
```
============================================================
EMOWEB Raspberry Pi Flask Server
============================================================

✓ System initialized successfully
✓ Server starting on port 5000
✓ CORS enabled for all origins
✓ Mode: Production

📡 Server URL: http://0.0.0.0:5000
📡 Network URL: http://<your-pi-ip>:5000

Press Ctrl+C to stop the server
```

### 4. Find Your Raspberry Pi IP Address

```bash
hostname -I
```

Example output: `192.168.1.100`

### 5. Update Your Development Machine

On your development machine (Windows), update `server/.env`:

```env
RASPBERRY_PI_URL=http://192.168.1.100:5000
```

Replace `192.168.1.100` with your actual Raspberry Pi IP address.

## Integration with emoweb.py

The Flask server expects these functions from your `emoweb.py`:

```python
def initialize_camera():
    """Initialize and return camera object"""
    # Your camera initialization code
    return camera

def initialize_hardware():
    """Initialize servos, OLED, Arduino, etc."""
    # Your hardware initialization code
    pass

def detect_emotion_from_frame(frame):
    """
    Detect emotion from a camera frame
    
    Args:
        frame: OpenCV frame (numpy array)
    
    Returns:
        dict: {
            'emotion': str,      # e.g., 'happy', 'sad', etc.
            'confidence': float, # e.g., 95.5
            'servoAngle': int    # e.g., 180 (optional)
        }
    """
    # Your emotion detection code
    return result
```

### Example Integration

Add these functions to your `emoweb.py`:

```python
def initialize_camera():
    """Initialize camera"""
    camera = cv2.VideoCapture(0)
    camera.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    return camera

def initialize_hardware():
    """Initialize all hardware components"""
    # Your existing setup code for:
    # - Servo motors
    # - OLED display
    # - Arduino communication
    # - etc.
    pass

def detect_emotion_from_frame(frame):
    """Detect emotion from camera frame"""
    # Your existing emotion detection logic
    # Use your TFLite model, preprocessing, etc.
    
    emotion = "happy"  # Your detection result
    confidence = 95.5   # Your confidence score
    
    return {
        'emotion': emotion,
        'confidence': confidence,
        'servoAngle': emotion_to_angle.get(emotion, 90)
    }
```

## Testing

### 1. Test Device Status

```bash
curl http://192.168.1.100:5000/api/status
```

Expected response:
```json
{
  "connected": true,
  "deviceId": "Raspberry Pi 4 - EMOWEB",
  "firmware": "v1.0.0",
  "camera": true,
  "emotionDetection": true,
  "servo": true,
  "timestamp": "2025-12-12T10:30:00.000000"
}
```

### 2. Test Camera Feed

Open in browser: `http://192.168.1.100:5000/api/camera_frame`

You should see a live camera image.

### 3. Test Emotion Detection

```bash
curl -X POST http://192.168.1.100:5000/api/detect_emotion
```

Expected response:
```json
{
  "emotion": "happy",
  "confidence": 95.5,
  "servoAngle": 180,
  "timestamp": "2025-12-12T10:30:00.000000"
}
```

## Full System Test

1. Start Raspberry Pi Flask server: `python3 emotion_flask_server.py`
2. Start Node.js backend: `cd server && npm run dev`
3. Start React frontend: `npm run dev`
4. Open browser: `http://localhost:5173`
5. Navigate to User Dashboard → Prototype panel
6. You should see:
   - ✅ Device Status: Online
   - ✅ Live camera feed
   - ✅ System Status indicators (green)
   - ✅ Click "Detect Emotion" to test

## Troubleshooting

### Camera Not Working

```bash
# Enable camera
sudo raspi-config
# Interface Options → Legacy Camera → Enable

# Test camera
raspistill -o test.jpg
```

### Permission Denied Errors

```bash
# Add user to video and gpio groups
sudo usermod -a -G video $USER
sudo usermod -a -G gpio $USER
sudo reboot
```

### Module Not Found

```bash
# Make sure files are in the same directory
ls -l /home/pi/emoweb/
# Should show both emotion_flask_server.py and emoweb.py
```

### Connection Refused

- Check firewall: `sudo ufw status`
- Check if server is running: `ps aux | grep flask`
- Check if port 5000 is in use: `sudo netstat -tulpn | grep 5000`

### Simulation Mode

If you see "Running in simulation mode", it means:
- RPi libraries not available (normal on non-Pi systems)
- The server will use mock emotion detection
- Good for testing the API without hardware

## API Endpoints

All endpoints are prefixed with `/api/`:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/status` | GET | Device status and capabilities |
| `/camera_frame` | GET | Current camera frame (JPEG) |
| `/detect_emotion` | POST | Trigger emotion detection |
| `/music_status` | GET | Music playback status |
| `/stop_music` | POST | Stop music playback |
| `/current_emotion` | GET | Last detected emotion |
| `/health` | GET | Health check |

## Auto-Start on Boot (Optional)

Create a systemd service to auto-start the server:

```bash
sudo nano /etc/systemd/system/emoweb.service
```

Add:
```ini
[Unit]
Description=EMOWEB Emotion Detection Server
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/emoweb
ExecStart=/usr/bin/python3 /home/pi/emoweb/emotion_flask_server.py
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable emoweb.service
sudo systemctl start emoweb.service
sudo systemctl status emoweb.service
```

## Support

If you encounter issues:
1. Check the server logs on Raspberry Pi
2. Verify network connectivity
3. Test each API endpoint individually
4. Check browser console for errors
