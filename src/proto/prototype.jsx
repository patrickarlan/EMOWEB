import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import './prototype.css';

export default function PrototypeDashboard() {
    const [deviceStatus, setDeviceStatus] = useState({
        connected: false,
        deviceId: 'Not Connected',
        lastActive: 'Never',
        firmware: 'N/A'
    });
    const [cameraActive, setCameraActive] = useState(false);
    const [emotionDetectionActive, setEmotionDetectionActive] = useState(false);
    const [servoActive, setServoActive] = useState(false);
    const [currentEmotion, setCurrentEmotion] = useState(null);
    const [emotionLogs, setEmotionLogs] = useState([]);
    const [musicStatus, setMusicStatus] = useState({
        playing: false,
        currentSong: null,
        emotion: null
    });
    const [cameraFrame, setCameraFrame] = useState(null);
    const [error, setError] = useState(null);
    
    const socketRef = useRef(null);
    const cameraIntervalRef = useRef(null);
    const statusIntervalRef = useRef(null);

    useEffect(() => {
        // Connect to Socket.IO server
        const socket = io('http://localhost:4000', {
            withCredentials: true
        });
        
        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('Connected to Socket.IO server');
            setError(null);
            // Request initial status
            socket.emit('request_device_status');
        });

        socket.on('device_status', (data) => {
            if (data.connected) {
                setDeviceStatus({
                    connected: true,
                    deviceId: data.deviceId || 'Raspberry Pi 4',
                    lastActive: new Date().toLocaleString(),
                    firmware: data.firmware || 'v1.0.0'
                });
                setCameraActive(data.camera || false);
                setEmotionDetectionActive(data.emotionDetection || false);
                setServoActive(data.servo || false);
                setError(null);
            } else {
                setDeviceStatus(prev => ({
                    ...prev,
                    connected: false
                }));
                setError(data.error || 'Device offline');
            }
        });

        socket.on('emotion_result', (data) => {
            const newLog = {
                id: Date.now(),
                emotion: data.emotion,
                confidence: data.confidence,
                timestamp: new Date().toLocaleString(),
                servoAngle: data.servoAngle
            };
            
            setCurrentEmotion(data.emotion);
            setEmotionLogs(prev => [newLog, ...prev].slice(0, 10)); // Keep last 10
            setEmotionDetectionActive(true);
        });

        socket.on('camera_frame', (data) => {
            setCameraFrame(data.image);
            setCameraActive(true);
        });

        socket.on('music_status', (data) => {
            setMusicStatus({
                playing: data.playing,
                currentSong: data.currentSong,
                emotion: data.emotion
            });
        });

        socket.on('emotion_error', (data) => {
            setError(data.message);
            setEmotionDetectionActive(false);
        });

        socket.on('camera_error', (data) => {
            setCameraActive(false);
        });

        socket.on('music_error', (data) => {
            setMusicStatus(prev => ({ ...prev, playing: false }));
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from Socket.IO server');
            setDeviceStatus(prev => ({ ...prev, connected: false }));
        });

        // Poll for camera frames every 2 seconds when connected
        cameraIntervalRef.current = setInterval(() => {
            if (socketRef.current?.connected) {
                socket.emit('request_camera_frame');
                socket.emit('request_music_status');
            }
        }, 2000);

        // Poll for device status every 10 seconds
        statusIntervalRef.current = setInterval(() => {
            if (socketRef.current?.connected) {
                socket.emit('request_device_status');
            }
        }, 10000);

        return () => {
            clearInterval(cameraIntervalRef.current);
            clearInterval(statusIntervalRef.current);
            socket.disconnect();
        };
    }, []);

    const handleRequestEmotion = () => {
        if (socketRef.current?.connected) {
            socketRef.current.emit('request_emotion');
        }
    };

    return (
        <div className="prototype-dashboard">
            <div className="prototype-header">
                <h1 className="prototype-title">Prototype Dashboard</h1>
                <p className="prototype-subtitle">Monitor and control your EMO device</p>
            </div>

            {error && (
                <div className="error-banner">
                    <span className="error-icon">⚠️</span>
                    <span className="error-text">{error}</span>
                </div>
            )}

            <div className="prototype-grid">
                <div className="prototype-panel prototype-overview">
                    <div className="panel-header">
                        <h2 className="panel-title">Device Overview</h2>
                        <span className={`status-badge ${deviceStatus.connected ? 'status-online' : 'status-offline'}`}>
                            {deviceStatus.connected ? 'Online' : 'Offline'}
                        </span>
                    </div>
                    <div className="panel-content">
                        <div className="overview-item">
                            <span className="overview-label">Device ID:</span>
                            <span className="overview-value">{deviceStatus.deviceId}</span>
                        </div>
                        <div className="overview-item">
                            <span className="overview-label">Last Active:</span>
                            <span className="overview-value">{deviceStatus.lastActive}</span>
                        </div>
                        <div className="overview-item">
                            <span className="overview-label">Firmware:</span>
                            <span className="overview-value">{deviceStatus.firmware}</span>
                        </div>
                    </div>
                </div>

                <div className="prototype-panel prototype-status">
                    <div className="panel-header">
                        <h2 className="panel-title">System Status</h2>
                    </div>
                    <div className="panel-content">
                        <div className="status-item">
                            <div className={`status-icon ${cameraActive ? 'status-active' : 'status-inactive'}`}></div>
                            <span className="status-text">Camera: {cameraActive ? 'Active' : 'Inactive'}</span>
                        </div>
                        <div className="status-item">
                            <div className={`status-icon ${emotionDetectionActive ? 'status-active' : 'status-inactive'}`}></div>
                            <span className="status-text">Emotion Detection: {emotionDetectionActive ? 'Active' : 'Inactive'}</span>
                        </div>
                        <div className="status-item">
                            <div className={`status-icon ${servoActive ? 'status-active' : 'status-inactive'}`}></div>
                            <span className="status-text">Servo Control: {servoActive ? 'Active' : 'Inactive'}</span>
                        </div>
                    </div>
                    {currentEmotion && (
                        <div className="current-emotion">
                            <h3>Current Emotion:</h3>
                            <div className="emotion-display">{currentEmotion}</div>
                        </div>
                    )}
                    {musicStatus.playing && (
                        <div className="music-display">
                            <span className="music-icon">🎵</span>
                            <span className="music-text">Playing: {musicStatus.currentSong}</span>
                            <span className="music-emotion">({musicStatus.emotion})</span>
                        </div>
                    )}
                </div>

                <div className="prototype-panel prototype-camera">
                    <div className="panel-header">
                        <h2 className="panel-title">Camera Feed</h2>
                        <button 
                            className="btn-detect-emotion"
                            onClick={handleRequestEmotion}
                            disabled={!deviceStatus.connected}
                        >
                            Detect Emotion
                        </button>
                    </div>
                    <div className="panel-content camera-content">
                        {cameraFrame ? (
                            <img 
                                src={cameraFrame} 
                                alt="Camera feed" 
                                className="camera-image"
                            />
                        ) : (
                            <div className="camera-placeholder">
                                <div className="placeholder-icon">📷</div>
                                <p className="placeholder-text">
                                    {deviceStatus.connected ? 'Waiting for camera feed...' : 'Camera offline'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="prototype-panel prototype-logs">
                    <div className="panel-header">
                        <h2 className="panel-title">Emotion Logs</h2>
                    </div>
                    <div className="panel-content logs-content">
                        {emotionLogs.length > 0 ? (
                            <div className="emotion-logs">
                                {emotionLogs.map(log => (
                                    <div key={log.id} className="emotion-log-item">
                                        <div className="log-header">
                                            <span className="log-emotion">{log.emotion}</span>
                                            <span className="log-confidence">{log.confidence}%</span>
                                        </div>
                                        <div className="log-details">
                                            <span className="log-time">{log.timestamp}</span>
                                            {log.servoAngle && (
                                                <span className="log-servo">Servo: {log.servoAngle}°</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="logs-placeholder">
                                <div className="placeholder-icon">📊</div>
                                <p className="placeholder-text">No emotion logs yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
