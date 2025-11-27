import React, { useState, useEffect } from "react";
import { X, Gift } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RecentJob = () => {
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();

  const handleDismiss = () => {
    setIsVisible(false);
  };

  const handleLearnMore = () => {
    navigate("/webscraping");
  };

  if (!isVisible) return null;

  return (
    <div className="w-full bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 relative overflow-hidden h-10 sm:h-12 flex items-center px-3 sm:px-6">
      {/* Decorative accent */}
      <div className="absolute left-0 top-0 w-20 h-20 bg-white opacity-5 rounded-full -ml-10 -mt-10"></div>

      {/* Close Button */}
      <button
        onClick={handleDismiss}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-0.5 hover:bg-white/20 rounded-full transition-colors"
        aria-label="Close banner"
      >
        <X className="w-4 h-4 text-white" />
      </button>

      {/* Content - Single Line */}
      <div className="relative z-10 flex items-center gap-2 sm:gap-3 flex-1 pr-8">
        <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-white flex-shrink-0" />
        <span className="text-white text-xs sm:text-sm font-bold truncate">
          🎉 <span className="font-black text-lg sm:text-xl">30%</span> OFF!
          Access the latest jobs from 10+ platforms — all in one place. Apply
          first. Get hired first.
        </span>
        <button
          onClick={handleLearnMore}
          className="ml-auto px-2 sm:px-3 py-1 bg-white text-orange-600 text-xs sm:text-sm font-bold rounded hover:bg-gray-100 transition-all duration-300 flex-shrink-0 whitespace-nowrap transform hover:scale-105 active:scale-95 animate-pulse"
        >
          Learn More
        </button>
      </div>
    </div>
  );
};

export default RecentJob;
