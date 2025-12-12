"""
EMOWEB Raspberry Pi Flask Server
This server provides REST API endpoints for the EMOWEB dashboard to communicate
with the Raspberry Pi emotion detection system.

Run this on your Raspberry Pi 4 after uploading your emoweb.py file.
"""

from flask import Flask, jsonify, request, Response
from flask_cors import CORS
import cv2
import base64
import numpy as np
from datetime import datetime
import io
import sys
import os

# Try to import Raspberry Pi specific libraries
try:
    import pigpio
    import RPi.GPIO as GPIO
    RPI_AVAILABLE = True
except ImportError:
    print("Warning: RPi libraries not available. Running in simulation mode.")
    RPI_AVAILABLE = False

# Try to import your emotion detection code
# Make sure emoweb.py is in the same directory
try:
    # Import your emotion detection functions from emoweb.py
    # Adjust these imports based on what functions you have in emoweb.py
    from emoweb import detect_emotion_from_frame, initialize_camera, initialize_hardware
    EMOTION_MODULE_AVAILABLE = True
except ImportError:
    print("Warning: emoweb.py not found. Using mock emotion detection.")
    EMOTION_MODULE_AVAILABLE = False

app = Flask(__name__)
CORS(app)

# Global variables
camera = None
current_emotion_data = {
    'emotion': None,
    'confidence': 0,
    'timestamp': None,
    'servoAngle': 90
}

music_status = {
    'playing': False,
    'currentSong': None,
    'emotion': None
}

# Emotion to servo angle mapping (adjust based on your hardware)
emotion_to_angle = {
    'happy': 180,
    'sad': 0,
    'angry': 45,
    'surprised': 135,
    'neutral': 90,
    'disgust': 60,
    'fear': 120
}

def initialize_system():
    """Initialize camera and hardware components"""
    global camera
    
    try:
        # Initialize camera
        if EMOTION_MODULE_AVAILABLE:
            camera = initialize_camera()
        else:
            # Fallback to OpenCV camera
            camera = cv2.VideoCapture(0)
            if camera.isOpened():
                camera.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
                camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
                camera.set(cv2.CAP_PROP_FPS, 30)
        
        # Initialize hardware (servo, OLED, etc.)
        if EMOTION_MODULE_AVAILABLE and RPI_AVAILABLE:
            initialize_hardware()
        
        print("✓ System initialized successfully")
        return True
    except Exception as e:
        print(f"✗ Error initializing system: {e}")
        return False

def capture_frame():
    """Capture a frame from the camera"""
    global camera
    
    if camera is None:
        return None, "Camera not initialized"
    
    try:
        success, frame = camera.read()
        if success:
            return frame, None
        return None, "Failed to capture frame"
    except Exception as e:
        return None, str(e)

def mock_detect_emotion(frame):
    """Mock emotion detection for testing without the actual model"""
    import random
    emotions = ['happy', 'sad', 'angry', 'surprised', 'neutral', 'disgust', 'fear']
    emotion = random.choice(emotions)
    confidence = round(random.uniform(75.0, 98.0), 2)
    
    return {
        'emotion': emotion,
        'confidence': confidence,
        'servoAngle': emotion_to_angle.get(emotion, 90)
    }

@app.route('/api/status', methods=['GET'])
def get_status():
    """Return device status and capabilities"""
    global camera
    
    camera_active = camera is not None and camera.isOpened() if camera else False
    
    return jsonify({
        'connected': True,
        'deviceId': 'Raspberry Pi 4 - EMOWEB',
        'firmware': 'v1.0.0',
        'camera': camera_active,
        'emotionDetection': EMOTION_MODULE_AVAILABLE or True,  # True for mock mode
        'servo': RPI_AVAILABLE,
        'timestamp': datetime.now().isoformat(),
        'mode': 'production' if EMOTION_MODULE_AVAILABLE else 'simulation'
    })

@app.route('/api/camera_frame', methods=['GET'])
def get_camera_frame():
    """Capture and return current camera frame as JPEG"""
    frame, error = capture_frame()
    
    if error:
        return jsonify({'error': error}), 500
    
    if frame is None:
        return jsonify({'error': 'No frame available'}), 500
    
    try:
        # Encode frame to JPEG
        _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
        frame_bytes = buffer.tobytes()
        
        return Response(frame_bytes, mimetype='image/jpeg')
    except Exception as e:
        return jsonify({'error': f'Failed to encode frame: {str(e)}'}), 500

@app.route('/api/detect_emotion', methods=['POST'])
def detect_emotion_endpoint():
    """Detect emotion from current camera frame"""
    global current_emotion_data
    
    # Capture frame
    frame, error = capture_frame()
    
    if error:
        return jsonify({'error': error}), 500
    
    if frame is None:
        return jsonify({'error': 'No frame available'}), 500
    
    try:
        # Detect emotion using your emoweb.py module or mock
        if EMOTION_MODULE_AVAILABLE:
            result = detect_emotion_from_frame(frame)
        else:
            result = mock_detect_emotion(frame)
        
        # Update current emotion data
        current_emotion_data = {
            'emotion': result.get('emotion', 'neutral'),
            'confidence': result.get('confidence', 0),
            'servoAngle': result.get('servoAngle', emotion_to_angle.get(result.get('emotion', 'neutral'), 90)),
            'timestamp': datetime.now().isoformat()
        }
        
        return jsonify(current_emotion_data)
    
    except Exception as e:
        return jsonify({'error': f'Emotion detection failed: {str(e)}'}), 500

@app.route('/api/music_status', methods=['GET'])
def get_music_status():
    """Return current music playback status"""
    global music_status
    
    # If you integrate music playback in emoweb.py, update this
    # For now, return the current status
    return jsonify(music_status)

@app.route('/api/stop_music', methods=['POST'])
def stop_music():
    """Stop music playback"""
    global music_status
    
    try:
        # If you have music playback functionality in emoweb.py, call it here
        # For now, just update the status
        music_status = {
            'playing': False,
            'currentSong': None,
            'emotion': None
        }
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/current_emotion', methods=['GET'])
def get_current_emotion():
    """Get the last detected emotion"""
    global current_emotion_data
    return jsonify(current_emotion_data)

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat()
    })

def cleanup():
    """Cleanup resources on shutdown"""
    global camera
    
    print("\nShutting down EMOWEB Flask Server...")
    
    if camera is not None:
        camera.release()
    
    if RPI_AVAILABLE:
        try:
            GPIO.cleanup()
        except:
            pass
    
    print("✓ Cleanup complete")

if __name__ == '__main__':
    import atexit
    
    print("=" * 60)
    print("EMOWEB Raspberry Pi Flask Server")
    print("=" * 60)
    
    # Register cleanup function
    atexit.register(cleanup)
    
    # Initialize system
    if initialize_system():
        try:
            print(f"\n✓ Server starting on port 5000")
            print(f"✓ CORS enabled for all origins")
            print(f"✓ Mode: {'Production' if EMOTION_MODULE_AVAILABLE else 'Simulation'}")
            print(f"\n📡 Server URL: http://0.0.0.0:5000")
            print(f"📡 Network URL: http://<your-pi-ip>:5000")
            print(f"\nPress Ctrl+C to stop the server\n")
            
            # Run Flask server
            app.run(
                host='0.0.0.0',
                port=5000,
                debug=False,  # Set to True for development
                threaded=True
            )
        except KeyboardInterrupt:
            print("\n\n✓ Server stopped by user")
        except Exception as e:
            print(f"\n✗ Server error: {e}")
    else:
        print("\n✗ Failed to initialize system. Check your hardware connections.")
        sys.exit(1)
        
