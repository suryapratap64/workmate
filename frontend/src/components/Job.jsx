import React from "react";
import { BiDislike, BiLike } from "react-icons/bi";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { FaRegStar } from "react-icons/fa";
import { FaMapMarkerAlt } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";

const Job = ({ job, onSelect }) => {
  const navigate = useNavigate();

  const handleLocationClick = () => {
    navigate(`/mapview/${encodeURIComponent(job.location)}`);
  };

  const handleJobClick = () => {
    // Call the onSelect callback if provided
    if (onSelect) {
      onSelect();
    }
    // Also navigate to the job detail page
    navigate(`/jobdetail/${job._id}`);
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm text-gray-500 font-medium">
                {new Date(job.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
              {job.verified && (
                <div className="flex items-center space-x-1">
                  <RiVerifiedBadgeFill className="text-blue-500 text-lg" />
                  <span className="text-xs text-blue-600 font-medium">
                    Verified
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={handleJobClick}
              className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors duration-200 block mb-2 text-left w-full"
            >
              {job.title}
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200">
              <BiLike className="text-lg" />
            </button>
            <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200">
              <BiDislike className="text-lg" />
            </button>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 mb-4 line-clamp-3">{job.description}</p>

        {/* Job Details */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center space-x-4">
            {/* Rating */}
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, idx) => (
                <FaRegStar key={idx} className="text-yellow-400 text-sm" />
              ))}
              <span className="text-sm text-gray-500 ml-1">(4.5)</span>
            </div>

            {/* Location */}
            <button
              onClick={handleLocationClick}
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors duration-200"
            >
              <FaMapMarkerAlt className="text-sm" />
              <span className="text-sm font-medium">{job.location}</span>
            </button>

            {/* Client Name */}
            {job.client ? (
              <div className="flex items-center space-x-1">
                <span className="text-gray-400">•</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/user/${job.client._id}`);
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200"
                >
                  {job.client.firstName} {job.client.lastName}
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <span className="text-gray-400">•</span>
                <span className="text-gray-500 text-sm">Unknown Client</span>
              </div>
            )}
          </div>

          {/* Prize */}
          <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
            ₹{job.prize}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(
                `/start-conversation?jobId=${job._id}&clientId=${job.client?._id}`
              );
            }}
            className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            <MessageCircle className="w-3 h-3" />
            <span>Message</span>
          </button>
        </div>

        {/* Images */}
        {job.images && job.images.length > 0 && (
          <div className="flex space-x-2 overflow-x-auto mt-1 pb-2">
            {job.images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`job-img-${i}`}
                className="w-16 h-16 object-cover rounded-lg border border-gray-200 flex-shrink-0"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Job;
