const app = require('./app');
const http = require('http');
const { Server } = require('socket.io');
const axios = require('axios');

const port = process.env.PORT || 4000;

// Create HTTP server
const server = http.createServer(app);

// Create Socket.IO server with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
  }
});

// Raspberry Pi Flask server URL
const RASPBERRY_PI_URL = process.env.RASPBERRY_PI_URL || 'http://raspberrypi.local:5000';

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Request emotion detection from Raspberry Pi
  socket.on('request_emotion', async () => {
    try {
      const response = await axios.post(`${RASPBERRY_PI_URL}/api/detect_emotion`, {}, {
        timeout: 5000
      });
      
      socket.emit('emotion_result', response.data);
    } catch (error) {
      console.error('Error connecting to Raspberry Pi:', error.message);
      socket.emit('emotion_error', { 
        message: 'Failed to connect to Raspberry Pi device',
        details: error.message 
      });
    }
  });

  // Request camera frame from Raspberry Pi
  socket.on('request_camera_frame', async () => {
    try {
      const response = await axios.get(`${RASPBERRY_PI_URL}/api/camera_frame`, {
        timeout: 5000,
        responseType: 'arraybuffer'
      });
      
      const base64Image = Buffer.from(response.data, 'binary').toString('base64');
      socket.emit('camera_frame', { image: `data:image/jpeg;base64,${base64Image}` });
    } catch (error) {
      console.error('Error fetching camera frame:', error.message);
      socket.emit('camera_error', { 
        message: 'Failed to fetch camera frame',
        details: error.message 
      });
    }
  });

  // Request music status from Raspberry Pi
  socket.on('request_music_status', async () => {
    try {
      const response = await axios.get(`${RASPBERRY_PI_URL}/api/music_status`, {
        timeout: 5000
      });
      
      socket.emit('music_status', response.data);
    } catch (error) {
      console.error('Error fetching music status:', error.message);
      socket.emit('music_error', { 
        message: 'Failed to fetch music status',
        details: error.message 
      });
    }
  });

  // Request device status from Raspberry Pi
  socket.on('request_device_status', async () => {
    try {
      const response = await axios.get(`${RASPBERRY_PI_URL}/api/status`, {
        timeout: 5000
      });
      
      socket.emit('device_status', response.data);
    } catch (error) {
      console.error('Error fetching device status:', error.message);
      socket.emit('device_status', { 
        connected: false,
        error: 'Device offline or unreachable' 
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
server.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
  console.log(`Socket.IO server ready`);
  console.log(`Raspberry Pi URL: ${RASPBERRY_PI_URL}`);
});
