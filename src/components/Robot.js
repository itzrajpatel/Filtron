import React from "react";
import "../styles/Robot.css";

const RobotWithSpeech = ({ text }) => {
  return (
    <div className="robot-wrapper">
      <div className="speech-bubble">
        <h2>{text}</h2>
      </div>
      <div className="robot">
        <svg
          width="200"
          height="200"
          viewBox="0 0 180 300"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Head */}
          <rect x="45" y="20" width="90" height="70" rx="15" fill="#0ff" stroke="#fff" strokeWidth="2" />
          {/* Eyes */}
          <circle className="eye" cx="65" cy="50" r="8" fill="black" />
          <circle className="eye" cx="115" cy="50" r="8" fill="black" />

          {/* Antennas */}
          <line x1="90" y1="10" x2="90" y2="20" stroke="#0ff" strokeWidth="3" />
          <circle cx="90" cy="10" r="5" fill="#0ff" />

          {/* Body */}
          <rect x="40" y="90" width="100" height="100" rx="20" fill="#111" stroke="#0ff" strokeWidth="2" />

          {/* Arms */}
          <rect className="wave-arm" x="10" y="100" width="20" height="80" rx="10" fill="#0ff" />
          <rect x="150" y="100" width="20" height="80" rx="10" fill="#0ff" />

          {/* Legs */}
          <rect x="55" y="200" width="20" height="60" rx="10" fill="#0ff" />
          <rect x="105" y="200" width="20" height="60" rx="10" fill="#0ff" />
        </svg>
      </div>
    </div>
  );
};

export default RobotWithSpeech;
