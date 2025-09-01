import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Button } from "./ui/button";
import {
  FaEdit,
  FaStar,
  FaMapMarkerAlt,
  FaClock,
  FaDollarSign,
  FaBriefcase,
  FaGraduationCap,
  FaGlobe,
  FaLinkedin,
  FaGithub,
  FaTwitter,
  FaExternalLinkAlt,
  FaCheckCircle,
  FaRegClock,
  FaRegMoneyBillAlt,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/api/v1/user/profile`, {
        withCredentials: true,
      });

      if (response.data.success) {
        setUser(response.data.user);
      } else {
        setError(response.data.message || "Failed to fetch profile");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError(error.response?.data?.message || "Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">
            {error || "Profile not found"}
          </h2>
          <p className="text-gray-600 mb-4">
            {error
              ? "There was an error loading your profile."
              : "Please log in to view your profile."}
          </p>
          <Button onClick={() => navigate("/login")}>Login</Button>
        </div>
      </div>
    );
  }

  const isWorker = user.userType === "worker";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {/* Profile Info */}
            <div className="flex items-center gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage
                  src={user.profilePicture || "https://via.placeholder.com/150"}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover"
                />
                <AvatarFallback className="w-24 h-24 text-2xl">
                  {user.firstName?.[0]}
                  {user.lastName?.[0]}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-col">
                <h1 className="text-3xl font-bold text-gray-900">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-gray-600 mt-1">
                  {isWorker ? "Freelancer" : "Client"}
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <FaMapMarkerAlt />
                    <span>
                      {user.city}, {user.state}, {user.country}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaRegClock />
                    <span>{user.availability || "Available"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={() => navigate("/edit-profile")}
                className="bg-green-600 hover:bg-green-700"
              >
                <FaEdit className="mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Bio Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">About</h2>
              <p className="text-gray-700 leading-relaxed">
                {user.bio ||
                  "No bio available. Add a bio to tell others about yourself and your expertise."}
              </p>
            </div>

            {/* Skills Section (for workers) */}
            {isWorker && user.skills && user.skills.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Experience Section (for workers) */}
            {isWorker && user.experience && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Experience</h2>
                <p className="text-gray-700">{user.experience}</p>
              </div>
            )}

            {/* Education Section (for workers) */}
            {isWorker && user.education && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Education</h2>
                <p className="text-gray-700">{user.education}</p>
              </div>
            )}

            {/* Portfolio Section (for workers) */}
            {isWorker && user.portfolio && user.portfolio.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Portfolio</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.portfolio.map((item, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">Project {index + 1}</h3>
                      <p className="text-gray-600 text-sm">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Company Info (for clients) */}
            {!isWorker && user.companyName && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Company Information
                </h2>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium">Company:</span>{" "}
                    {user.companyName}
                  </div>
                  {user.companySize && (
                    <div>
                      <span className="font-medium">Size:</span>{" "}
                      {user.companySize}
                    </div>
                  )}
                  {user.industry && (
                    <div>
                      <span className="font-medium">Industry:</span>{" "}
                      {user.industry}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Statistics</h3>
              <div className="space-y-4">
                {isWorker ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Hourly Rate</span>
                      <span className="font-semibold">
                        ₹{user.hourlyRate || 0}/hr
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Completed Jobs</span>
                      <span className="font-semibold">
                        {user.completedJobs || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total Earnings</span>
                      <span className="font-semibold">
                        ₹{user.totalEarnings || 0}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Posted Jobs</span>
                      <span className="font-semibold">
                        {user.postedJobs || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Hired Workers</span>
                      <span className="font-semibold">
                        {user.hiredWorkers || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total Spent</span>
                      <span className="font-semibold">
                        ₹{user.totalSpent || 0}
                      </span>
                    </div>
                  </>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Rating</span>
                  <div className="flex items-center gap-1">
                    <FaStar className="text-yellow-400" />
                    <span className="font-semibold">{user.rating || 0}</span>
                    <span className="text-gray-500">
                      ({user.totalReviews || 0})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">
                Contact Information
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-600">Email:</span>
                  <p className="font-medium">{user.email || "Not provided"}</p>
                </div>
                <div>
                  <span className="text-gray-600">Phone:</span>
                  <p className="font-medium">{user.mobileNumber}</p>
                </div>
                <div>
                  <span className="text-gray-600">Location:</span>
                  <p className="font-medium">
                    {user.localAddress}, {user.city}, {user.state}
                  </p>
                </div>
              </div>
            </div>

            {/* Social Links */}
            {user.socialLinks && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Social Links</h3>
                <div className="space-y-3">
                  {user.socialLinks.linkedin && (
                    <a
                      href={user.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                    >
                      <FaLinkedin />
                      <span>LinkedIn</span>
                      <FaExternalLinkAlt className="text-xs" />
                    </a>
                  )}
                  {user.socialLinks.github && (
                    <a
                      href={user.socialLinks.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-gray-800 hover:text-gray-900"
                    >
                      <FaGithub />
                      <span>GitHub</span>
                      <FaExternalLinkAlt className="text-xs" />
                    </a>
                  )}
                  {user.socialLinks.website && (
                    <a
                      href={user.socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-green-600 hover:text-green-800"
                    >
                      <FaGlobe />
                      <span>Website</span>
                      <FaExternalLinkAlt className="text-xs" />
                    </a>
                  )}
                  {!user.socialLinks.linkedin &&
                    !user.socialLinks.github &&
                    !user.socialLinks.website && (
                      <p className="text-gray-500 text-sm">
                        No social links added
                      </p>
                    )}
                </div>
              </div>
            )}

            {/* Languages (for workers) */}
            {isWorker && user.languages && user.languages.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {user.languages.map((language, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                    >
                      {language}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications (for workers) */}
            {isWorker &&
              user.certifications &&
              user.certifications.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold mb-4">Certifications</h3>
                  <div className="space-y-2">
                    {user.certifications.map((cert, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <FaCheckCircle className="text-green-500" />
                        <span className="text-sm">{cert}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
