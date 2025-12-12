const app = require('./app');
const http = require('http');
const { Server } = require('socket.io');
const { io: Client } = require('socket.io-client');

const port = process.env.PORT || 4000;

// Create HTTP server
const server = http.createServer(app);

// Create Socket.IO server with CORS for React clients
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
  }
});

// Raspberry Pi WebSocket server URL
const RASPBERRY_PI_URL = process.env.RASPBERRY_PI_URL || 'http://192.168.52.75:5000';

// Connect to emotion_oled2.py as a WebSocket client
let raspberryPiSocket = null;
let isRaspberryPiConnected = false;
let lastEmotionData = null;
let lastCameraFrame = null;
let lastServoPosition = { pan: 90, tilt: 90 };

function connectToRaspberryPi() {
  console.log(`Connecting to Raspberry Pi at ${RASPBERRY_PI_URL}...`);
  
  raspberryPiSocket = Client(RASPBERRY_PI_URL, {
    reconnection: true,
    reconnectionDelay: 2000,
    reconnectionAttempts: Infinity
  });

  raspberryPiSocket.on('connect', () => {
    console.log('✓ Connected to Raspberry Pi WebSocket');
    isRaspberryPiConnected = true;
    
    // Request initial status
    raspberryPiSocket.emit('get_status');
  });

  raspberryPiSocket.on('disconnect', () => {
    console.log('✗ Disconnected from Raspberry Pi');
    isRaspberryPiConnected = false;
  });

  // Listen to emotion_update from emotion_oled2.py
  raspberryPiSocket.on('emotion_update', (data) => {
    console.log('Received emotion_update:', data);
    lastEmotionData = data;
    
    // Translate to emotion_result for React clients
    const emotionResult = {
      emotion: data.emotion,
      confidence: Math.round(data.confidence * 100), // Convert to percentage
      servoAngle: data.servo_angle,
      timestamp: new Date().toISOString()
    };
    
    // Broadcast to all connected React clients
    io.emit('emotion_result', emotionResult);
  });

  // Listen to camera_frame from emotion_oled2.py
  raspberryPiSocket.on('camera_frame', (data) => {
    lastCameraFrame = data.frame;
    
    // Python sends base64 without prefix, add it for browser
    const imageData = data.frame.startsWith('data:image') 
      ? data.frame 
      : `data:image/jpeg;base64,${data.frame}`;
    
    // Forward to React clients
    io.emit('camera_frame', { image: imageData });
  });

  // Listen to servo_position from emotion_oled2.py
  raspberryPiSocket.on('servo_position', (data) => {
    console.log('Servo position:', data);
    lastServoPosition = data;
  });

  // Listen to status from emotion_oled2.py
  raspberryPiSocket.on('status', (data) => {
    console.log('Device status:', data);
    
    // Translate to device_status for React
    const deviceStatus = {
      connected: true,
      deviceId: 'Raspberry Pi 4',
      lastActive: new Date().toLocaleString(),
      firmware: 'v1.0.0',
      camera: data.camera || true,
      emotionDetection: data.emotion_detection || true,
      servo: data.servo || true
    };
    
    io.emit('device_status', deviceStatus);
  });

  raspberryPiSocket.on('connect_error', (error) => {
    console.error('Connection error:', error.message);
  });
}

// Initialize connection to Raspberry Pi
connectToRaspberryPi();

// Socket.IO connection handler for React clients
io.on('connection', (socket) => {
  console.log('React client connected:', socket.id);

  // Send cached data immediately on connection
  if (lastCameraFrame) {
    const imageData = lastCameraFrame.startsWith('data:image') 
      ? lastCameraFrame 
      : `data:image/jpeg;base64,${lastCameraFrame}`;
    socket.emit('camera_frame', { image: imageData });
  }
  
  if (lastEmotionData) {
    socket.emit('emotion_result', {
      emotion: lastEmotionData.emotion,
      confidence: Math.round(lastEmotionData.confidence * 100),
      servoAngle: lastEmotionData.servo_angle,
      timestamp: new Date().toISOString()
    });
  }

  // Request emotion detection from Raspberry Pi
  socket.on('request_emotion', () => {
    if (isRaspberryPiConnected && raspberryPiSocket) {
      console.log('Requesting emotion detection...');
      // emotion_oled2.py automatically detects emotions, just request a frame
      raspberryPiSocket.emit('request_frame');
    } else {
      socket.emit('emotion_error', { 
        message: 'Failed to connect to Raspberry Pi device',
        details: 'WebSocket connection not established' 
      });
    }
  });

  // Request camera frame from Raspberry Pi
  socket.on('request_camera_frame', () => {
    if (isRaspberryPiConnected && raspberryPiSocket) {
      raspberryPiSocket.emit('request_frame');
      
      // If we have cached frame, send it immediately
      if (lastCameraFrame) {
        const imageData = lastCameraFrame.startsWith('data:image') 
          ? lastCameraFrame 
          : `data:image/jpeg;base64,${lastCameraFrame}`;
        socket.emit('camera_frame', { image: imageData });
      }
    } else {
      socket.emit('camera_error', { 
        message: 'Failed to fetch camera frame',
        details: 'WebSocket connection not established' 
      });
    }
  });

  // Request music status from Raspberry Pi
  socket.on('request_music_status', () => {
    // Music feature not implemented yet, send mock data
    socket.emit('music_status', {
      playing: false,
      currentSong: null,
      emotion: null
    });
  });

  // Request device status from Raspberry Pi
  socket.on('request_device_status', () => {
    if (isRaspberryPiConnected && raspberryPiSocket) {
      raspberryPiSocket.emit('get_status');
      
      // Send immediate response with current state
      socket.emit('device_status', {
        connected: true,
        deviceId: 'Raspberry Pi 4',
        lastActive: new Date().toLocaleString(),
        firmware: 'v1.0.0',
        camera: true,
        emotionDetection: lastEmotionData !== null,
        servo: true
      });
    } else {
      socket.emit('device_status', { 
        connected: false,
        error: 'Device offline or unreachable' 
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('React client disconnected:', socket.id);
  });
});

// Start server
server.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
  console.log(`Socket.IO server ready for React clients`);
  console.log(`Raspberry Pi URL: ${RASPBERRY_PI_URL}`);
});
