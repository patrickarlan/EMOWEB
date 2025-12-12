# Raspberry Pi Flask Server Setup Guide

This guide will help you set up the Python Flask server on your Raspberry Pi 4 for emotion recognition integration with the EMOWEB dashboard.

## Prerequisites

- Raspberry Pi 4 with Raspbian OS installed
- Camera module connected to Raspberry Pi
- Python 3.7 or higher
- Network connection (same network as your development machine)

## Installation Steps

### 1. Install Required Packages

```bash
sudo apt-get update
sudo apt-get install python3-pip python3-opencv
pip3 install flask flask-socketio flask-cors opencv-python numpy tensorflow
```

### 2. Create Flask Server

Create a file `emotion_server.py` on your Raspberry Pi:

```python
from flask import Flask, jsonify, request
from flask_socketio import SocketIO
from flask_cors import CORS
import cv2
import base64
import numpy as np
from datetime import datetime
import RPi.GPIO as GPIO
import pygame

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Servo setup
SERVO_PIN = 18
GPIO.setmode(GPIO.BCM)
GPIO.setup(SERVO_PIN, GPIO.OUT)
servo = GPIO.PWM(SERVO_PIN, 50)  # 50Hz PWM
servo.start(0)

# Music setup
pygame.mixer.init()

# Camera setup
camera = cv2.VideoCapture(0)
camera.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

# Emotion detection model (replace with your trained model)
# emotion_model = load_your_model()

current_music = {
    'playing': False,
    'currentSong': None,
    'emotion': None
}

emotion_to_angle = {
    'happy': 180,
    'sad': 0,
    'angry': 45,
    'surprised': 135,
    'neutral': 90
}

emotion_to_music = {
    'happy': 'happy_song.mp3',
    'sad': 'sad_song.mp3',
    'angry': 'energetic_song.mp3',
    'surprised': 'upbeat_song.mp3',
    'neutral': 'calm_song.mp3'
}

def set_servo_angle(angle):
    """Set servo motor to specific angle (0-180)"""
    duty = angle / 18 + 2
    GPIO.output(SERVO_PIN, True)
    servo.ChangeDutyCycle(duty)
    time.sleep(0.5)
    GPIO.output(SERVO_PIN, False)
    servo.ChangeDutyCycle(0)

def play_music(emotion):
    """Play music based on detected emotion"""
    global current_music
    
    if emotion in emotion_to_music:
        song_path = f'/home/pi/music/{emotion_to_music[emotion]}'
        try:
            pygame.mixer.music.load(song_path)
            pygame.mixer.music.play()
            current_music = {
                'playing': True,
                'currentSong': emotion_to_music[emotion],
                'emotion': emotion
            }
        except Exception as e:
            print(f"Error playing music: {e}")
            current_music['playing'] = False

def detect_emotion(frame):
    """
    Detect emotion from camera frame
    Replace this with your actual emotion detection model
    """
    # Example placeholder - replace with your model
    # processed_frame = preprocess_frame(frame)
    # prediction = emotion_model.predict(processed_frame)
    # emotion = get_emotion_from_prediction(prediction)
    # confidence = get_confidence(prediction)
    
    # For testing purposes, return a mock result:
    return {
        'emotion': 'happy',
        'confidence': 95.5
    }

@app.route('/api/status', methods=['GET'])
def get_status():
    """Return device status"""
    return jsonify({
        'connected': True,
        'deviceId': 'Raspberry Pi 4',
        'firmware': 'v1.0.0',
        'camera': camera.isOpened(),
        'emotionDetection': True,
        'servo': True,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/camera_frame', methods=['GET'])
def get_camera_frame():
    """Capture and return current camera frame"""
    success, frame = camera.read()
    
    if not success:
        return jsonify({'error': 'Failed to capture frame'}), 500
    
    # Encode frame to JPEG
    _, buffer = cv2.imencode('.jpg', frame)
    frame_bytes = buffer.tobytes()
    
    return frame_bytes, 200, {'Content-Type': 'image/jpeg'}

@app.route('/api/detect_emotion', methods=['POST'])
def detect_emotion_endpoint():
    """Detect emotion from current camera frame"""
    success, frame = camera.read()
    
    if not success:
        return jsonify({'error': 'Failed to capture frame'}), 500
    
    # Detect emotion
    result = detect_emotion(frame)
    emotion = result['emotion']
    confidence = result['confidence']
    
    # Set servo angle based on emotion
    angle = emotion_to_angle.get(emotion, 90)
    set_servo_angle(angle)
    
    # Play corresponding music
    play_music(emotion)
    
    return jsonify({
        'emotion': emotion,
        'confidence': confidence,
        'servoAngle': angle,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/music_status', methods=['GET'])
def get_music_status():
    """Return current music playback status"""
    global current_music
    
    # Check if music is still playing
    if current_music['playing'] and not pygame.mixer.music.get_busy():
        current_music['playing'] = False
    
    return jsonify(current_music)

@app.route('/api/stop_music', methods=['POST'])
def stop_music():
    """Stop music playback"""
    global current_music
    pygame.mixer.music.stop()
    current_music['playing'] = False
    return jsonify({'success': True})

if __name__ == '__main__':
    try:
        print("Starting Raspberry Pi Emotion Recognition Server...")
        print("Server will be available at: http://raspberrypi.local:5000")
        socketio.run(app, host='0.0.0.0', port=5000, debug=True)
    except KeyboardInterrupt:
        print("\\nShutting down server...")
    finally:
        camera.release()
        servo.stop()
        GPIO.cleanup()
        pygame.mixer.quit()
```

### 3. Create Music Directory

```bash
mkdir -p /home/pi/music
# Add your music files to this directory:
# - happy_song.mp3
# - sad_song.mp3
# - energetic_song.mp3
# - upbeat_song.mp3
# - calm_song.mp3
```

### 4. Run the Server

```bash
python3 emotion_server.py
```

### 5. Find Your Raspberry Pi IP Address

```bash
hostname -I
```

### 6. Update Node.js Server Configuration

On your development machine, add to `server/.env`:

```env
RASPBERRY_PI_URL=http://YOUR_RASPBERRY_PI_IP:5000
# Or use mDNS if available:
# RASPBERRY_PI_URL=http://raspberrypi.local:5000
```

## Testing the Integration

1. Start your Raspberry Pi Flask server
2. Start your Node.js backend server: `cd server && npm run dev`
3. Start your React frontend: `npm run dev`
4. Navigate to the User Dashboard
5. Click on the "Prototype" panel
6. You should see:
   - Device status showing "Online"
   - Live camera feed updating every 2 seconds
   - Click "Detect Emotion" to trigger emotion detection
   - Emotion logs will appear with detected emotions
   - Music status will show when playing

## Troubleshooting

### Camera Not Working

```bash
# Enable camera interface
sudo raspi-config
# Navigate to: Interfacing Options > Camera > Enable

# Test camera
raspistill -o test.jpg
```

### Connection Issues

- Ensure Raspberry Pi and development machine are on the same network
- Check firewall settings on Raspberry Pi
- Try using IP address instead of `raspberrypi.local`
- Verify port 5000 is not blocked

### Servo Not Moving

```bash
# Check GPIO permissions
sudo usermod -a -G gpio $USER
# Reboot after adding to group
sudo reboot
```

### Music Not Playing

- Ensure pygame is installed: `pip3 install pygame`
- Check audio output: `sudo raspi-config` > System Options > Audio
- Verify music files exist in `/home/pi/music/`
- Check file permissions: `chmod +r /home/pi/music/*.mp3`

## API Endpoints

The Flask server provides these endpoints:

- `GET /api/status` - Device status and capabilities
- `GET /api/camera_frame` - Current camera frame (JPEG)
- `POST /api/detect_emotion` - Trigger emotion detection
- `GET /api/music_status` - Current music playback status
- `POST /api/stop_music` - Stop music playback

## Circuit Diagram

```
Raspberry Pi GPIO Layout:
- Servo Motor Signal: GPIO 18 (Pin 12)
- Servo Motor Power: 5V (Pin 2)
- Servo Motor Ground: GND (Pin 6)
- Camera: CSI Camera Port
```

## Notes

- The emotion detection model placeholder needs to be replaced with your actual trained model
- Make sure to train or download an emotion recognition model (e.g., using TensorFlow/Keras)
- Common models: FER-2013, AffectNet
- You may need to adjust servo angles based on your physical setup
- Music files should be in MP3 format for best compatibility
