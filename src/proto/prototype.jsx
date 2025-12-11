import React from 'react';
import './prototype.css';

export default function PrototypeDashboard() {
    return (
        <div className="prototype-dashboard">
            <div className="prototype-header">
                <h1 className="prototype-title">Prototype Dashboard</h1>
                <p className="prototype-subtitle">Monitor and control your EMO device</p>
            </div>

            <div className="prototype-grid">
                <div className="prototype-panel prototype-overview">
                    <div className="panel-header">
                        <h2 className="panel-title">Device Overview</h2>
                        <span className="status-badge status-offline">Offline</span>
                    </div>
                    <div className="panel-content">
                        <div className="overview-item">
                            <span className="overview-label">Device ID:</span>
                            <span className="overview-value">Not Connected</span>
                        </div>
                        <div className="overview-item">
                            <span className="overview-label">Last Active:</span>
                            <span className="overview-value">Never</span>
                        </div>
                        <div className="overview-item">
                            <span className="overview-label">Firmware:</span>
                            <span className="overview-value">N/A</span>
                        </div>
                    </div>
                </div>

                <div className="prototype-panel prototype-status">
                    <div className="panel-header">
                        <h2 className="panel-title">System Status</h2>
                    </div>
                    <div className="panel-content">
                        <div className="status-item">
                            <div className="status-icon status-inactive"></div>
                            <span className="status-text">Camera: Inactive</span>
                        </div>
                        <div className="status-item">
                            <div className="status-icon status-inactive"></div>
                            <span className="status-text">Emotion Detection: Inactive</span>
                        </div>
                        <div className="status-item">
                            <div className="status-icon status-inactive"></div>
                            <span className="status-text">Servo Control: Inactive</span>
                        </div>
                    </div>
                </div>

                <div className="prototype-panel prototype-placeholder">
                    <div className="panel-header">
                        <h2 className="panel-title">Camera Feed</h2>
                    </div>
                    <div className="panel-content camera-placeholder">
                        <div className="placeholder-icon">📷</div>
                        <p className="placeholder-text">Camera panel will be added soon</p>
                    </div>
                </div>

                <div className="prototype-panel prototype-placeholder">
                    <div className="panel-header">
                        <h2 className="panel-title">Emotion Logs</h2>
                    </div>
                    <div className="panel-content logs-placeholder">
                        <div className="placeholder-icon">📊</div>
                        <p className="placeholder-text">Emotion logs will be added soon</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
