import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Briefcase, Clock, ExternalLink, Star } from "lucide-react";

const JobCard = ({ job, onSelect, onApply }) => {
  const navigate = useNavigate();

  // Determine theme based on platform
  const getPlatformTheme = () => {
    switch (job.platform?.toLowerCase()) {
      case "internshala":
        return {
          badgeBg: "bg-green-100",
          badgeText: "text-green-800",
          borderColor: "border-green-200 hover:border-green-400",
          headerHover: "group-hover:text-green-600",
          accentColor: "text-green-600",
          accentBg: "bg-green-50",
          accentHover: "hover:bg-green-100",
          tagBg: "bg-green-100 text-green-700",
          tagHover: "hover:bg-green-200",
        };
      case "linkedin":
      default:
        return {
          badgeBg: "bg-blue-100",
          badgeText: "text-blue-800",
          borderColor: "border-blue-200 hover:border-blue-400",
          headerHover: "group-hover:text-blue-600",
          accentColor: "text-blue-600",
          accentBg: "bg-blue-50",
          accentHover: "hover:bg-blue-100",
          tagBg: "bg-blue-100 text-blue-700",
          tagHover: "hover:bg-blue-200",
        };
    }
  };

  const theme = getPlatformTheme();

  useEffect(() => {
    if (job && job.postedDate) {
      console.log(`📌 JobCard rendered - ${job.title}:`, {
        postedDate: job.postedDate,
        platform: job.platform,
      });
    }
  }, [job]);

  const getRelativeTime = (dateStr) => {
    if (!dateStr) return "Recently posted";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "Recently posted";

      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
      return `${Math.floor(diffDays / 30)}mo ago`;
    } catch {
      return "Recently posted";
    }
  };

  return (
    <div
      onClick={() => {
        navigate(`/jobs/${job._id}`);
        onSelect?.(job);
      }}
      className={`border-b ${
        theme.borderColor.includes("hover")
          ? "border-gray-200 hover:border-b-2"
          : "border-gray-200"
      } pb-4 last:border-b-0 hover:bg-gray-50 transition-all duration-200 cursor-pointer group`}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left Content */}
        <div className="flex-1 min-w-0">
          {/* Title and Company */}
          <div className="mb-2">
            <h3
              className={`text-base font-semibold text-gray-900 ${theme.headerHover} transition-colors line-clamp-1`}
            >
              {job.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <p className={`${theme.accentColor} text-sm font-medium`}>
                {job.company}
              </p>
              {job.easyApply && (
                <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-semibold flex items-center gap-0.5">
                  <Star size={11} className="fill-current" /> Easy
                </span>
              )}
            </div>
          </div>

          {/* Meta Info Row */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <MapPin size={13} className="text-gray-400" />
              <span className="font-medium">{job.location || "Remote"}</span>
            </div>
            <div className="flex items-center gap-1">
              <Briefcase size={13} className="text-gray-400" />
              <span className="font-medium">{job.jobType || "Full-time"}</span>
            </div>
            {job.salary && job.salary !== "Not disclosed" && (
              <div className="text-green-700 font-bold">{job.salary}</div>
            )}
          </div>

          {/* Description Snippet */}
          {job.description && (
            <p className="text-xs text-gray-600 mt-2 line-clamp-1">
              {job.description}
            </p>
          )}

          {/* Skills Tags */}
          {job.skills && job.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {job.skills.slice(0, 3).map((skill, idx) => (
                <span
                  key={idx}
                  className={`text-xs px-2 py-1 ${theme.tagBg} rounded-full font-medium`}
                >
                  {skill}
                </span>
              ))}
              {job.skills.length > 3 && (
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">
                  +{job.skills.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Posted Date, Badge, Apply Button */}
        <div className="flex items-start gap-3 ml-2">
          <div className="text-right flex-shrink-0">
            <div className="flex flex-col items-end gap-2">
              {/* Posted Date - Highlighted */}
              <div className="flex items-center gap-1">
                <Clock size={13} className={theme.accentColor} />
                <span className={`${theme.accentColor} font-bold text-xs`}>
                  {getRelativeTime(job.postedDate || job.scrapedDate)}
                </span>
              </div>

              {/* Platform Badge */}
              <span
                className={`${theme.badgeBg} ${theme.badgeText} px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap`}
              >
                {job.platform}
              </span>
            </div>
          </div>

          {/* Apply Button */}
          <a
            href={job.applyLink || job.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.stopPropagation();
              onApply?.(job);
            }}
            className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold ${theme.accentColor} ${theme.accentBg} ${theme.accentHover} rounded transition-colors`}
          >
            Apply
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
