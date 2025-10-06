import React from "react";

const Logo = ({ className = "" }) => {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* SVG Icon */}
      <div className="w-8 h-8 flex-shrink-0">
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 50 20 L 70 40 L 50 60 L 30 40 L 50 20 Z"
            fill="#1E3A8A"
            opacity="0.8"
          />
          <path
            d="M 50 60 L 70 80 L 50 100 L 30 80 L 50 60 Z"
            fill="#10B981"
            opacity="0.9"
          />
          <path
            d="M 50 20 L 50 100"
            stroke="#0D9488"
            strokeWidth={5}
            strokeLinecap="round"
            opacity="0.1"
          />
        </svg>
      </div>

      {/* Wordmark */}
      <div className="text-2xl font-extrabold tracking-tight">
        <span className="text-[#1E3A8A]">Work</span>
        <span
          className="bg-clip-text text-transparent bg-gradient-to-r from-[#10B981] to-[#047857]"
          style={{ textShadow: "0 4px 8px rgba(16, 185, 129, 0.3)" }}
        >
          mate
        </span>
      </div>
    </div>
  );
};

export default Logo;
