"use client";

import React from "react";
import { Activity } from "lucide-react";

const LoadingBubble = () => {
  return (
    <div className="message-row assistant-row loading-row">
      <div className="message-avatar assistant-avatar">
        <div className="assistant-avatar-inner">
          <span className="f1-badge-text">F1</span>
        </div>
      </div>

      <div className="message-bubble bubble-assistant loading-bubble">
        <div className="gantry-header">
          <div className="gantry-lights" aria-label="Starting grid lights loading">
            <span className="light light-1"></span>
            <span className="light light-2"></span>
            <span className="light light-3"></span>
            <span className="light light-4"></span>
            <span className="light light-5"></span>
          </div>
          <span className="telemetry-label">
            <Activity size={12} className="pulse-icon" />
            TELEMETRY STREAM CONNECTED
          </span>
        </div>

        <div className="loading-status-text">
          <span className="loading-dots">Computing track data and querying vector archives</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingBubble;
