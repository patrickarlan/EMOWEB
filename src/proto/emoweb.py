#!/usr/bin/env python
progname = "emotion_track.py"
ver = "ver 1.4-threaded"

"""
emotion-track combines face detection, emotion recognition, and pan/tilt tracking.
Detects emotions in real-time and tracks the face using servo motors.
Displays corresponding emotion expressions on OLED screen.
Uses pigpio for servo control with THREADED scanning for smooth movement.
"""

print("===================================")
print("%s %s using python3 and OpenCV" % (progname, ver))
print("Loading Libraries  Please Wait ....")

import os
import sys
import time
import cv2
import numpy as np
import tflite_runtime.interpreter as tflite #type: ignore
from threading import Thread
import RPi.GPIO as GPIO
import pigpio #type: ignore
from luma.core.interface.serial import i2c #type: ignore
from luma.oled.device import sh1106 #type: ignore
from PIL import Image, ImageDraw
from flask import Flask, Response
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import base64

# controllers
from arduino_anim_controller import ArduinoAnimController
from music_controller import MusicController


mypath = os.path.abspath(__file__)
baseDir = mypath[0:mypath.rfind("/")+1]
baseFileName = mypath[mypath.rfind("/")+1:mypath.rfind(".")]
progName = os.path.basename(__file__)

# music dir init
music = MusicController(music_dir=baseDir + "musics")

# Read Configuration variables from config.py file
configFilePath = baseDir + "config.py"
if not os.path.exists(configFilePath):
    print("ERROR - Missing config.py file")
    sys.exit(1)

from config import *

# --- EMOTION DETECTION CONFIGURATION ---
MODEL_PATH = os.path.join(baseDir, 'Emotion_Detector/emotion_quarter_size.tflite')
if not os.path.exists(MODEL_PATH):
    print(f"ERROR: Model not found at {MODEL_PATH}")
    sys.exit(1)



# Emotion labels mapper
emotion_mapper = {0:'anger', 1:'disgust', 2:'fear', 3:'happiness', 4:'sadness', 5:'surprise', 6:'neutral'}
confidence_threshold = 70  # in %
repeat_threshold = 3  # stable emotion detections

# Face detection filtering variables
face_history = []
face_history_size = 5
min_face_size = (30, 30)
max_face_size = (CAMERA_WIDTH - 20, CAMERA_HEIGHT - 20)
movement_threshold = 15
stabilization_delay = 0.05

# LED setup
RED_LED = 27
GREEN_LED = 22
GPIO.setmode(GPIO.BCM)
GPIO.setup(RED_LED, GPIO.OUT)
GPIO.setup(GREEN_LED, GPIO.OUT)
GPIO.output(RED_LED, GPIO.LOW)
GPIO.output(GREEN_LED, GPIO.LOW)


# Pigpio setup for servo control
print("Initializing pigpio...")
try:
    pi = pigpio.pi()
    if not pi.connected:
        print("ERROR: Could not connect to pigpio daemon")
        print("Make sure pigpiod is running: sudo systemctl start pigpiod")
        sys.exit(1)
    print("pigpio connected successfully")
except Exception as e:
    print(f"ERROR: Failed to initialize pigpio: {e}")
    print("Make sure pigpiod is running: sudo systemctl start pigpiod")
    sys.exit(1)

ARDUINO_PORT = '/dev/ttyUSB0'
ARDUINO_BAUD = 115200
anim_controller = ArduinoAnimController(port=ARDUINO_PORT, baud=ARDUINO_BAUD)

# Flask and WebSocket setup
app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

# WebSocket state
websocket_clients = 0
latest_frame = None
latest_emotion_data = {
    'emotion': None,
    'confidence': 0,
    'servoAngle': 90,
    'timestamp': None
}

# Setup servo pins for pigpio
pan_pin = GPIOZERO_PAN_PIN
tilt_pin = GPIOZERO_TILT_PIN

# Servo pulse width range (in microseconds) for MG90S servo
MIN_PULSE = 500      # 0° (approximately)
MAX_PULSE = 2500     # 180° (approximately)

# Pan/Tilt angle ranges
pan_min_angle = 0
pan_max_angle = 180
tilt_min_angle = 20
tilt_max_angle = 90

# --- GLOBAL VARIABLES FOR THREADING ---
current_pan = 90.0
current_tilt = 20.0
is_scanning = True
program_running = True

FOV_H = 62.2  # Horizontal Field of View in degrees
FOV_V = 48.8  # Vertical Field of View in degrees

# OLED Setup
try:
    print("Initializing OLED Display...")
    serial = i2c(port=1, address=0x3C)
    oled = sh1106(serial, rotate=0)
    oled.contrast(255)
    oled_ready = True
    print("OLED Display Ready")
except Exception as e:
    print(f"WARNING: OLED not available: {e}")
    oled_ready = False
    oled = None

# Create Calculated Variables
cam_cx = CAMERA_WIDTH / 2
cam_cy = CAMERA_HEIGHT / 2
big_w = int(CAMERA_WIDTH * WINDOW_BIGGER)
big_h = int(CAMERA_HEIGHT * WINDOW_BIGGER)

# Setup haar_cascade variables
face_cascade = cv2.CascadeClassifier(fface1_haar_path)
frontalface = cv2.CascadeClassifier(fface2_haar_path)
profileface = cv2.CascadeClassifier(pface1_haar_path)

# Color data for OpenCV Markings
blue = (255, 0, 0)
green = (0, 255, 0)
red = (0, 0, 255)
white = (255, 255, 255)
yellow = (0, 255, 255)

# Load TFLite model
try:
    print("Loading TFLite Emotion Model...")
    interpreter = tflite.Interpreter(model_path=MODEL_PATH)
    interpreter.allocate_tensors()
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()
    INPUT_SHAPE = input_details[0]['shape'][1:3]
    print(f"Model Loaded. Input shape: {INPUT_SHAPE}")
except Exception as e:
    print(f"ERROR: Failed to load TFLite model: {e}")
    sys.exit(1)

# FPS calculation
freq = cv2.getTickFrequency()
font = cv2.FONT_HERSHEY_SIMPLEX
frame_rate_calc = 0

#-------------------------------------------------------------------------------------------
def angle_to_pulse(angle, min_angle=0, max_angle=180, min_pulse=MIN_PULSE, max_pulse=MAX_PULSE):
    """Convert angle (0-180) to servo pulse width in microseconds"""
    return min_pulse + (angle / (max_angle - min_angle)) * (max_pulse - min_pulse)

#-------------------------------------------------------------------------------------------
def set_servo_angle(pin, angle, min_angle=0, max_angle=180):
    """Set servo to specific angle using pigpio"""
    try:
        # Clamp angle to valid range
        angle = max(min_angle, min(max_angle, angle))
        
        # Convert angle to pulse width
        pulse = angle_to_pulse(angle)
        # Set servo pulse using pigpio
        pi.set_servo_pulsewidth(pin, pulse)
        
        return angle
    except Exception as e:
        if debug:
            print(f"Servo error on pin {pin}: {e}")
        return angle


def get_servo_offset(target_pixel, center_pixel, fov_degrees, total_pixels):
    """
    Calculate how many degrees to move based on pixel distance from center.
    Returns the angle delta (positive or negative).
    """
    pixel_diff = center_pixel - target_pixel 
    # Formula: (Distance from center / Total Width) * FOV
    angle_offset = (pixel_diff / total_pixels) * fov_degrees
    return angle_offset

#-------------------------------------------------------------------------------------------
#  THREADED SCANNING FUNCTION
#-------------------------------------------------------------------------------------------
def scanning_thread_func():
    global current_pan, current_tilt, is_scanning, program_running
    
    pan_step = 0.5   # Small steps for smoothness
    tilt_step = 5.0  # Step size for tilt when pan completes
    pan_direction = 1 # 1 for right, -1 for left
    
    print("Starting Background Scanning Thread...")
    
    while program_running:
        if is_scanning:
            # Update Pan
            current_pan += (pan_step * pan_direction)
            
            # Check Limits and Reverse
            if current_pan >= pan_max_angle:
                current_pan = pan_max_angle
                pan_direction = -1
                anim_controller.set_scan_anim("A2")
                
                # Move Tilt when pan hits edge
                current_tilt += tilt_step
                if current_tilt > tilt_max_angle:
                    current_tilt = tilt_min_angle
                    
            elif current_pan <= pan_min_angle:
                current_pan = pan_min_angle
                pan_direction = 1
                anim_controller.set_scan_anim("A3")
                
                # Move Tilt when pan hits edge
                current_tilt += tilt_step
                if current_tilt > tilt_max_angle:
                    current_tilt = tilt_min_angle

            # Apply to Servos
            set_servo_angle(pan_pin, current_pan, pan_min_angle, pan_max_angle)
            set_servo_angle(tilt_pin, current_tilt, tilt_min_angle, tilt_max_angle)
            print("Scanning - Pan: %.1f°, Tilt: %.1f°" % (current_pan, current_tilt))
            # Short sleep for smooth movement (50Hz updates approx)
            time.sleep(0.02) 
        else:
            # If not scanning (face found), sleep longer to save CPU
            time.sleep(0.1)

#-------------------------------------------------------------------------------------------
class PiVideoStream:
    def __init__(self, resolution=(CAMERA_WIDTH, CAMERA_HEIGHT), framerate=CAMERA_FRAMERATE, 
                 rotation=0, hflip=False, vflip=False):
        from picamera2 import Picamera2 #type: ignore
        self.picam2 = Picamera2()
        
        config = self.picam2.create_video_configuration(
            main={"format": "RGB888", "size": resolution}
        )
        self.picam2.configure(config)
        self.picam2.start()
        
        self.rotation = rotation
        self.hflip = hflip
        self.vflip = vflip
        
        self.frame = None
        self.stopped = False

    def start(self):
        t = Thread(target=self.update, args=())
        t.daemon = True
        t.start()
        return self

    def update(self):
        while not self.stopped:
            frame = self.picam2.capture_array()
            
            if self.rotation != 0:
                frame = cv2.rotate(frame, cv2.ROTATE_90_CLOCKWISE if self.rotation == 90 else cv2.ROTATE_180)
            
            if self.hflip:
                frame = cv2.flip(frame, 1)
            if self.vflip:
                frame = cv2.flip(frame, 0)
            
            self.frame = frame
        
        self.picam2.stop()

    def read(self):
        return self.frame

    def stop(self):
        self.stopped = True
        time.sleep(0.1)

#-----------------------------------------------------------------------------------------------
def check_timer(start_time, duration):
    return time.time() - start_time <= duration

#-----------------------------------------------------------------------------------------------
def pan_goto(pan_target, tilt_target):
    """Move pan/tilt servos to target angles and update GLOBAL position"""
    global current_pan, current_tilt
    
    # Clamp angles to valid range
    pan_target = max(pan_min_angle, min(pan_max_angle, pan_target))
    tilt_target = max(tilt_min_angle, min(tilt_max_angle, tilt_target))
    
    # Set servo angles
    set_servo_angle(pan_pin, pan_target, pan_min_angle, pan_max_angle)
    set_servo_angle(tilt_pin, tilt_target, tilt_min_angle, tilt_max_angle)
    
    # IMPORTANT: Update Global State so thread knows where we are if it resumes
    current_pan = pan_target
    current_tilt = tilt_target
    
    if verbose:
        print(f"pan_goto - Pan: {pan_target:.1f}°, Tilt: {tilt_target:.1f}°")
    
    return pan_target, tilt_target

#-----------------------------------------------------------------------------------------------
def face_detect(image):
    """Detect face using multiple cascade classifiers"""
    ffaces = face_cascade.detectMultiScale(image, 1.1, 5)
    if len(ffaces) > 0:
        face = ffaces[0]
        if verbose:
            print("face_detect - Found Frontal Face using face_cascade")
    else:
        pfaces = profileface.detectMultiScale(image, 1.1, 5)
        if len(pfaces) > 0:
            face = pfaces[0]
            if verbose:
                print("face_detect - Found Profile Face")
        else:
            ffaces = frontalface.detectMultiScale(image, 1.1, 5)
            if len(ffaces) > 0:
                face = ffaces[0]
                if verbose:
                    print("face_detect - Found Frontal Face using frontalface")
            else:
                face = ()
    return face

#-----------------------------------------------------------------------------------------------
def validate_face(face_data, image_width, image_height):
    """Validate face detection to reduce false positives"""
    if len(face_data) == 0:
        return False
    
    (fx, fy, fw, fh) = face_data
    
    if fw < min_face_size[0] or fh < min_face_size[1]:
        return False
    
    if fw > max_face_size[0] or fh > max_face_size[1]:
        return False
    
    if fx < 0 or fy < 0 or (fx + fw) > image_width or (fy + fh) > image_height:
        return False
    
    return True

#-----------------------------------------------------------------------------------------------
def smooth_face_detection(face_data, history_list):
    """Average face position over multiple frames to reduce jitter"""
    if len(face_data) > 0:
        (fx, fy, fw, fh) = face_data
        cx = int(fx + fw/2)
        cy = int(fy + fh/2)
        history_list.append((cx, cy, fw, fh))
    
    if len(history_list) > face_history_size:
        history_list.pop(0)
    
    if len(history_list) >= face_history_size:
        avg_cx = int(sum(h[0] for h in history_list) / len(history_list))
        avg_cy = int(sum(h[1] for h in history_list) / len(history_list))
        avg_fw = int(sum(h[2] for h in history_list) / len(history_list))
        avg_fh = int(sum(h[3] for h in history_list) / len(history_list))
        return (avg_cx, avg_cy, avg_fw, avg_fh), history_list
    
    return None, history_list

#-----------------------------------------------------------------------------------------------
def should_move_servo(current_cx, current_cy, last_cx, last_cy):
    """Only move servos if movement exceeds threshold"""
    distance = ((current_cx - last_cx)**2 + (current_cy - last_cy)**2)**0.5
    return distance > movement_threshold

#-----------------------------------------------------------------------------------------------
def pixel_to_servo_angle(pixel_pos, max_pixels, min_angle=0, max_angle=180):
    """Convert pixel position to servo angle"""
    # Map pixel position (0 to max_pixels) to angle range
    angle = min_angle + (pixel_pos / max_pixels) * (max_angle - min_angle)
    return angle

#-----------------------------------------------------------------------------------------------
def detect_emotion(face_roi):
    """Detect emotion from face ROI using TFLite model"""
    try:
        # Resize to model input shape
        face_resized = cv2.resize(face_roi, INPUT_SHAPE)
        face_gray = cv2.cvtColor(face_resized, cv2.COLOR_RGB2GRAY) if len(face_resized.shape) == 3 else face_resized
        
        # Normalize and prepare for model
        face_expanded = np.expand_dims(face_gray / 255.0, axis=2).astype('float32')
        face_expanded = np.expand_dims(face_expanded, axis=0)
        
        # Run inference
        interpreter.set_tensor(input_details[0]['index'], face_expanded)
        interpreter.invoke()
        output_data = interpreter.get_tensor(output_details[0]['index'])
        
        confidence = np.max(output_data[0]) * 100
        emotion_idx = np.argmax(output_data[0])
        
        return emotion_idx, confidence
    except Exception as e:
        if debug:
            print(f"detect_emotion error: {e}")
        return 6, 0  # Return neutral with 0 confidence

#-----------------------------------------------------------------------------------------------
# WebSocket Helper Functions
#-----------------------------------------------------------------------------------------------
def broadcast_emotion_update(emotion_name, confidence, servo_angle):
    """Broadcast emotion update to all connected WebSocket clients"""
    global latest_emotion_data
    
    latest_emotion_data = {
        'emotion': emotion_name,
        'confidence': round(float(confidence), 2),
        'servoAngle': int(servo_angle),
        'timestamp': time.time(),
        'panAngle': round(float(current_pan), 1),
        'tiltAngle': round(float(current_tilt), 1)
    }
    
    if websocket_clients > 0:
        socketio.emit('emotion_update', latest_emotion_data)

def broadcast_frame(frame):
    """Broadcast camera frame to all connected WebSocket clients"""
    global latest_frame
    
    if websocket_clients > 0:
        try:
            # Encode frame as JPEG
            _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
            frame_base64 = base64.b64encode(buffer).decode('utf-8')
            latest_frame = frame_base64
            socketio.emit('camera_frame', {'frame': frame_base64})
        except Exception as e:
            if debug:
                print(f"Frame broadcast error: {e}")

def broadcast_servo_position():
    """Broadcast current servo position"""
    if websocket_clients > 0:
        socketio.emit('servo_position', {
            'pan': round(float(current_pan), 1),
            'tilt': round(float(current_tilt), 1)
        })

#-----------------------------------------------------------------------------------------------
# WebSocket Event Handlers
#-----------------------------------------------------------------------------------------------
@socketio.on('connect')
def handle_connect():
    global websocket_clients
    websocket_clients += 1
    print(f'WebSocket client connected. Total clients: {websocket_clients}')
    emit('connection_response', {
        'status': 'connected',
        'message': 'Connected to EMOWEB Emotion Tracker'
    })
    
    # Send latest data to new client
    if latest_emotion_data['emotion']:
        emit('emotion_update', latest_emotion_data)
    if latest_frame:
        emit('camera_frame', {'frame': latest_frame})

@socketio.on('disconnect')
def handle_disconnect():
    global websocket_clients
    websocket_clients = max(0, websocket_clients - 1)
    print(f'WebSocket client disconnected. Total clients: {websocket_clients}')

@socketio.on('get_status')
def handle_get_status():
    emit('status', {
        'emotion': latest_emotion_data.get('emotion'),
        'confidence': latest_emotion_data.get('confidence'),
        'servoAngle': latest_emotion_data.get('servoAngle'),
        'pan': round(float(current_pan), 1),
        'tilt': round(float(current_tilt), 1),
        'scanning': is_scanning
    })

@socketio.on('request_frame')
def handle_request_frame():
    if latest_frame:
        emit('camera_frame', {'frame': latest_frame})

#-----------------------------------------------------------------------------------------------
def run_websocket_server():
    """Run Flask-SocketIO server in a separate thread"""
    print("Starting WebSocket server on port 5000...")
    socketio.run(app, host='0.0.0.0', port=5000, debug=False, use_reloader=False, allow_unsafe_werkzeug=True)

#-----------------------------------------------------------------------------------------------
def update_leds(emotion_idx):
    """Update LEDs based on emotion"""
    GPIO.output(RED_LED, GPIO.LOW)
    GPIO.output(GREEN_LED, GPIO.LOW)
    
    if emotion_idx == 3:  # Happy
        GPIO.output(GREEN_LED, GPIO.HIGH)
    else:
        GPIO.output(RED_LED, GPIO.HIGH)

#-----------------------------------------------------------------------------------------------
def emotion_track():
    global is_scanning, current_pan, current_tilt
    
    # Start WebSocket server in background thread
    websocket_thread = Thread(target=run_websocket_server, daemon=True)
    websocket_thread.start()
    print("WebSocket server started on http://0.0.0.0:5000")
    time.sleep(2)  # Give server time to start
    
    print("Initializing Pi Camera ....")
    if window_on:
        print("press q to quit opencv window display")
    else:
        print("press ctrl-c to quit SSH or terminal session")

    
    anim_controller.connect()

    vs = PiVideoStream(
        resolution=(CAMERA_WIDTH, CAMERA_HEIGHT),
        framerate=CAMERA_FRAMERATE,
        rotation=CAMERA_ROTATION,
        hflip=CAMERA_HFLIP,
        vflip=CAMERA_VFLIP
    ).start()
    print("Reading Stream from Picamera2... Wait ...")
    time.sleep(2)

    # Position start
    # current_pan = 90.0
    # current_tilt = 90.0
    # pan_goto(90, 90)
    
    fps_counter = 0
    fps_start = time.time()
    face_start = time.time()
    
    face_history = []
    last_valid_cx = cam_cx
    last_valid_cy = cam_cy
    
    # Emotion state tracking
    prev_emotion_idx = 6  # neutral
    emotion_repeats = 0
    current_emotion_text = "Analyzing..."
    
    # Stabilization tracking
    face_detected_time = None
    is_stabilizing = False
    face_locked = False

    img_frame = vs.read()
    print("Position pan/tilt to center (90°, 20°)")
    pan_goto(90, 20)
    
    # START THE SCANNING THREAD
    scan_thread = Thread(target=scanning_thread_func)
    scan_thread.daemon = True
    scan_thread.start()
    
    print("===================================")
    print("Start Emotion Tracking ....")
    print("")
    
    still_scanning = True
    t1 = time.time()
    
    while still_scanning:
        face_found = False
        Nav_LR = 0
        Nav_UD = 0
        
        t1 = cv2.getTickCount()
        
        img_frame = vs.read()
        if img_frame is None:
            continue
        
        # Broadcast frame to WebSocket clients (every 5th frame to reduce bandwidth)
        if fps_counter % 5 == 0:
            broadcast_frame(img_frame)
            
        frame_copy = np.copy(img_frame)
        frame_gray = cv2.cvtColor(frame_copy, cv2.COLOR_RGB2GRAY)
        
        if check_timer(face_start, timer_face):
            # Search for Face
            face_data = face_detect(frame_gray)
            
            if validate_face(face_data, CAMERA_WIDTH, CAMERA_HEIGHT):
                if is_scanning:
                    is_scanning = False
                    time.sleep(0.05)

                smoothed_face, face_history = smooth_face_detection(face_data, face_history)
                
                if smoothed_face is not None:
                    # FACE FOUND - STOP SCANNING
                    # is_scanning = False 
                    face_found = True
                    
                    (cx, cy, fw, fh) = smoothed_face
                    
                    # Initialize stabilization timer on first face detection
                    if face_detected_time is None:
                        face_detected_time = time.time()
                        is_stabilizing = True
                        face_locked = False
                    
                    # Only move servos DURING stabilization phase (before it's locked)
                    if is_stabilizing and not face_locked:
                        if should_move_servo(cx, cy, last_valid_cx, last_valid_cy):
                            pan_offset = get_servo_offset(cx, cam_cx, FOV_H, CAMERA_WIDTH)
                            tilt_offset = get_servo_offset(cy, cam_cy, FOV_V, CAMERA_HEIGHT)
                            
                            # Apply offset to CURRENT servo position
                            # Note: If face is to the LEFT (cx < cam_cx), offset is positive.
                            # We need to turn LEFT (increase angle? depends on servo mount)
                            # Usually: Left pixels require increasing Pan Angle (if 180 is left)
                            
                            new_pan = current_pan + pan_offset
                            new_tilt = current_tilt - tilt_offset # Tilt usually inverted
                            
                            pan_goto(new_pan, new_tilt)
                            
                            last_valid_cx = cx
                            last_valid_cy = cy
                    
                    # Check if stabilization delay has passed
                    if time.time() - face_detected_time > stabilization_delay:
                        is_stabilizing = False
                        face_locked = True  # Lock servos after stabilization
                        
                        # Extract face ROI for emotion detection
                        fx = int(cx - fw/2)
                        fy = int(cy - fh/2)
                        fx = max(0, fx)
                        fy = max(0, fy)
                        fx_end = min(CAMERA_WIDTH, fx + fw)
                        fy_end = min(CAMERA_HEIGHT, fy + fh)
                        
                        face_roi = frame_copy[fy:fy_end, fx:fx_end]
                        
                        if face_roi.size > 0:
                            # Detect emotion
                            emotion_idx, confidence = detect_emotion(face_roi)
                            current_emotion_text = f"{emotion_mapper[emotion_idx]} ({confidence:.1f}%)"
                            
                            # Emotion state machine
                            if confidence > confidence_threshold:
                                update_leds(emotion_idx)
                                anim_controller.set_emotion(emotion_idx)
                                music.play_emotion(emotion_mapper[emotion_idx], confidence/100.0)
                                print(f"CURRENT EMOTION: {emotion_mapper[emotion_idx]} with {confidence:.1f}% confidence")
                                
                                # Broadcast emotion to WebSocket clients
                                broadcast_emotion_update(
                                    emotion_mapper[emotion_idx],
                                    confidence,
                                    current_pan
                                )
                                
                                if emotion_idx == prev_emotion_idx:
                                    emotion_repeats += 1
                                else:
                                    if emotion_repeats >= repeat_threshold:
                                        print(f"STABLE EMOTION CHANGED TO: {emotion_mapper[emotion_idx]}")
                                        prev_emotion_idx = emotion_idx
                                        emotion_repeats = 1
                                    
                                
                    face_start = time.time()
            else:
                # FACE LOST - RESUME SCANNING
                if not is_scanning:
                    # Only print once when switching mode
                    if debug: print("Face Lost - Resuming Sweep")
                    anim_controller.set_emotion(6)  # Neutral
                    
                is_scanning = True
                
                face_history = []
                face_detected_time = None
                is_stabilizing = False
                face_locked = False
                emotion_repeats = 0
                current_emotion_text = "Analyzing..."
                face_start = time.time()

        if window_on:
            if face_found:
                fx = int(last_valid_cx - fw/2)
                fy = int(last_valid_cy - fh/2)
                cv2.rectangle(frame_copy, (fx, fy), (fx+fw, fy+fh), blue, 2)
                cv2.putText(frame_copy, current_emotion_text, (fx, fy - 10), 
                           font, 0.7, white, 2, cv2.LINE_AA)
                
                if is_stabilizing:
                    elapsed = time.time() - face_detected_time
                    remaining = stabilization_delay - elapsed
                    cv2.putText(frame_copy, f"STABILIZING... {remaining:.2f}s", (fx, fy + fh + 25), 
                               font, 0.6, yellow, 2, cv2.LINE_AA)
                elif face_locked:
                    cv2.putText(frame_copy, "LOCKED", (fx, fy + fh + 25), 
                               font, 0.7, green, 2, cv2.LINE_AA)
                    cv2.putText(frame_copy, f"Stable: {emotion_mapper[prev_emotion_idx]} x{emotion_repeats}", 
                               (10, CAMERA_HEIGHT - 10), font, 0.6, yellow, 2)
            else:
                cv2.putText(frame_copy, "SEARCHING...", (10, 30), font, 0.8, red, 2)

            t2 = cv2.getTickCount()
            time_diff = (t2 - t1) / freq
            fps_calc = 1 / time_diff if time_diff > 0 else 0
            cv2.putText(frame_copy, f"FPS: {fps_calc:.2f}", (10, 60), font, 0.7, yellow, 2)
            
            # Show servo status from Global Variables
            servo_status = "SERVOS LOCKED" if face_locked else ("SCANNING" if is_scanning else "TRACKING")
            servo_angles = f"Pan: {current_pan:.0f}° Tilt: {current_tilt:.0f}°"
            cv2.putText(frame_copy, servo_status, (10, CAMERA_HEIGHT - 40), 
                        font, 0.6, green if face_locked else yellow, 2, cv2.LINE_AA)
            cv2.putText(frame_copy, servo_angles, (10, CAMERA_HEIGHT - 20), 
                        font, 0.6, yellow, 2, cv2.LINE_AA)

            if WINDOW_BIGGER > 1:
                frame_copy = cv2.resize(frame_copy, (big_w, big_h))

            cv2.imshow('Emotion Track - q quits', frame_copy)

            if cv2.waitKey(1) & 0xFF == ord('q'):
                vs.stop()
                cv2.destroyAllWindows()
                print("emotion_track - End Emotion Tracking")
                still_scanning = False

#-----------------------------------------------------------------------------------------------
if __name__ == '__main__':
    try:
        emotion_track()
    except KeyboardInterrupt:
        print("")
        print("User Pressed Keyboard ctrl-c")
    finally:
        print("Cleaning up GPIO and servos...")
        program_running = False # Kill the thread
        time.sleep(0.5)
        pi.set_servo_pulsewidth(pan_pin, 0)
        pi.set_servo_pulsewidth(tilt_pin, 0)
        pi.stop()
        GPIO.cleanup()
        if oled_ready and oled is not None:
            oled.clear()
        print("")
        print("%s %s Exiting Program" % (progName, ver))