import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  ExternalLink,
  ArrowLeft,
  Loader,
  AlertCircle,
} from "lucide-react";
import { fetchScrapedJobById } from "../../services/webscraping.service";

const JobDetailPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch job data when component mounts
  useEffect(() => {
    const loadJobDetails = async () => {
      try {
        setLoading(true);
        const data = await fetchScrapedJobById(jobId);

        // Handle both { job: {...} } and direct job object responses
        const jobData = data.job || data;

        if (!jobData) {
          setError("Job not found");
        } else {
          setJob(jobData);
        }
      } catch (err) {
        console.error("Error fetching job details:", err);
        setError(err.message || "Failed to load job details");
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      loadJobDetails();
    }
  }, [jobId]);

  // Get relative time for posted date
  const getRelativeTime = (dateStr) => {
    if (!dateStr) return "Recently posted";
    try {
      const date = new Date(dateStr);
      const now = new Date();

      if (isNaN(date.getTime())) {
        return "Recently posted";
      }

      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      const diffWeeks = Math.floor(diffDays / 7);
      const diffMonths = Math.floor(diffDays / 30);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays}d ago`;
      if (diffWeeks < 4) return `${diffWeeks}w ago`;
      if (diffMonths < 12) return `${diffMonths}mo ago`;

      return date.toLocaleDateString();
    } catch {
      return "Recently posted";
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading job details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 max-w-md w-full text-center shadow-sm">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Job Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            {error ||
              "The job you're looking for doesn't exist or has been removed."}
          </p>
          <button
            onClick={() => navigate("/webscraping/home")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Back Button */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 md:px-6 py-4 shadow-sm z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate("/webscraping/home")}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-semibold transition"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">Back to Jobs</span>
            <span className="sm:hidden">Back</span>
          </button>
          <a
            href={job.applyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2  text-white rounded-lg  transition font-semibold"
          >
            Apply Now
            <ExternalLink size={16} />
          </a>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-4 md:px-6 py-12 border-b border-gray-200">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start justify-between mb-8">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900">
                {job.title}
              </h1>
              <p className="text-xl text-blue-600 font-semibold mb-2">
                {job.company}
              </p>
              <p className="text-sm text-gray-600">
                Posted {getRelativeTime(job.postedDate || job.scrapedDate)}
              </p>
            </div>
            <div
              className={`px-4 py-2 rounded-lg flex-shrink-0 ${
                job.platform?.toLowerCase() === "internshala"
                  ? "bg-green-100 text-green-800"
                  : "bg-blue-100 text-blue-800"
              } font-semibold`}
            >
              <p className="text-sm">{job.platform}</p>
            </div>
          </div>

          {/* Quick Meta Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={18} className="text-gray-500" />
                <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">
                  Location
                </p>
              </div>
              <p className="font-semibold text-sm text-gray-900">
                {job.location || "Remote"}
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase size={18} className="text-gray-500" />
                <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">
                  Type
                </p>
              </div>
              <p className="font-semibold text-sm text-gray-900">
                {job.jobType || "Full-time"}
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={18} className="text-green-600" />
                <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">
                  Salary
                </p>
              </div>
              <p className="font-semibold text-sm text-gray-900">
                {job.salary ? (
                  <span className="text-green-600">{job.salary}</span>
                ) : (
                  <span className="text-gray-400">Not disclosed</span>
                )}
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={18} className="text-gray-500" />
                <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">
                  Posted
                </p>
              </div>
              <p className="font-semibold text-sm text-gray-900">
                {getRelativeTime(job.postedDate || job.scrapedDate)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 md:px-6 py-12 max-w-4xl mx-auto">
        {/* Overview Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Left Column - Main Details */}
          <div className="md:col-span-2 space-y-6">
            {/* About Section */}
            {job.description && (
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b border-gray-200">
                About the Job
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                  {job.description}
                </p>
              </div>
            )}

            {/* Experience Section */}
            {(job.experience || job.experienceLevel) && (
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b border-gray-200">
                  Experience Required
                </h2>
                <p className="text-gray-700 text-sm md:text-base font-medium">
                  {job.experience || job.experienceLevel}
                </p>
              </div>
            )}

            {/* Skills Section */}
            {job.skills && job.skills.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b border-gray-200">
                  🎯 Required Skills ({job.skills.length})
                </h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        job.platform?.toLowerCase() === "internshala"
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                      }`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-4">
            {/* Apply Card */}
            <div
              className={`rounded-lg p-6 shadow-sm border ${
                job.platform?.toLowerCase() === "internshala"
                  ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
                  : "bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200"
              }`}
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Ready to Apply?
              </h3>
              <p className="text-sm text-gray-700 mb-4">
                Click the button below to apply on {job.platform}
              </p>
              <a
                href={job.applyLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`block w-full py-3 px-4 text-center font-semibold rounded-lg transition-all text-white `}
              >
                Apply Now →
              </a>
              <a
                href={job.applyLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full mt-2 py-2 px-4 text-center text-sm font-medium text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition-all"
              >
                View on {job.platform}
              </a>
            </div>

            {/* Quick Info Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm space-y-4">
              <div>
                <p className="text-xs text-gray-600 font-bold uppercase tracking-wide mb-1">
                  Platform
                </p>
                <div
                  className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    job.platform?.toLowerCase() === "internshala"
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {job.platform}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-bold uppercase tracking-wide mb-1">
                  Job Type
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {job.jobType || "Full-time"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-bold uppercase tracking-wide mb-1">
                  Location
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {job.location || "Remote"}
                </p>
              </div>
              {job.salary && job.salary !== "Not disclosed" && (
                <div>
                  <p className="text-xs text-gray-600 font-bold uppercase tracking-wide mb-1">
                    Salary
                  </p>
                  <p className="text-sm font-semibold text-green-600">
                    {job.salary}
                  </p>
                </div>
              )}
              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-600 font-bold uppercase tracking-wide mb-1">
                  Posted
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {getRelativeTime(job.postedDate || job.scrapedDate)}
                </p>
              </div>
            </div>

            {/* Share Card - Optional */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-3">
                Share This Job
              </h3>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Link copied to clipboard!");
                }}
                className="w-full py-2 px-3 text-sm font-medium text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition-all"
              >
                 Copy Link
              </button>
            </div>
          </div>
        </div>

        {/* Full Details Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b border-gray-200">
             Full Job Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-gray-600 font-bold uppercase tracking-wide mb-2">
                Job Title
              </p>
              <p className="text-base font-semibold text-gray-900">
                {job.title}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 font-bold uppercase tracking-wide mb-2">
                Company
              </p>
              <p className="text-base font-semibold text-gray-900">
                {job.company}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 font-bold uppercase tracking-wide mb-2">
                Location
              </p>
              <p className="text-base font-semibold text-gray-900">
                {job.location || "Remote"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 font-bold uppercase tracking-wide mb-2">
                Job Type
              </p>
              <p className="text-base font-semibold text-gray-900">
                {job.jobType || "Full-time"}
              </p>
            </div>
            {job.salary && (
              <div>
                <p className="text-xs text-gray-600 font-bold uppercase tracking-wide mb-2">
                  Salary
                </p>
                <p className="text-base font-semibold text-green-600">
                  {job.salary}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-600 font-bold uppercase tracking-wide mb-2">
                Platform
              </p>
              <p className="text-base font-semibold text-gray-900">
                {job.platform}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 font-bold uppercase tracking-wide mb-2">
                Posted Date
              </p>
              <p className="text-base font-semibold text-gray-900">
                {job.postedDate
                  ? new Date(job.postedDate).toLocaleDateString()
                  : "Recently"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 font-bold uppercase tracking-wide mb-2">
                Posted Time Ago
              </p>
              <p className="text-base font-semibold text-gray-900">
                {getRelativeTime(job.postedDate || job.scrapedDate)}
              </p>
            </div>
            {job.experience && (
              <div>
                <p className="text-xs text-gray-600 font-bold uppercase tracking-wide mb-2">
                  Experience
                </p>
                <p className="text-base font-semibold text-gray-900">
                  {job.experience}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailPage;
