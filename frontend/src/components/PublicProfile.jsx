import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../lib/axios";
import {
  MapPin,
  Clock,
  Share2,
  MoreVertical,
  Award,
  Briefcase,
} from "lucide-react";

const PublicProfile = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/user/${id}`);
        if (res.data?.success) {
          setUser(res.data.user);
        } else {
          setError(res.data?.message || "User not found");
        }
      } catch (err) {
        console.error("PublicProfile fetch error", err);
        setError(err.message || "Failed to fetch user");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600 text-center">
          <div className="text-xl font-semibold mb-2">Error</div>
          <div>{error}</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">No profile to show</div>
      </div>
    );
  }

  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {/* Header Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start mb-6">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 overflow-hidden flex items-center justify-center flex-shrink-0">
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-4xl font-bold text-white">
                      {user.firstName?.charAt(0) || user.name?.charAt(0) || "U"}
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
              </div>

              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">
                  {user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user.name || "User"}
                  {user.verified && (
                    <span className="ml-2 inline-flex items-center justify-center w-6 h-6 bg-blue-500 rounded-full text-white text-xs">
                      ✓
                    </span>
                  )}
                </h1>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-gray-600 text-sm mb-3">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {user.city && user.country
                      ? `${user.city}, ${user.country}`
                      : user.country || user.state || "Location not specified"}
                  </span>
                  <span className="mx-2">•</span>
                  <Clock className="w-4 h-4" />
                  <span>{currentTime} local time</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0 w-full sm:w-auto">
              <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                <Share2 className="w-5 h-5" />
                <span className="text-sm font-medium">Share</span>
              </button>
              <button className="w-full sm:w-auto p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center">
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-4 border-t border-b border-gray-200">
            <div>
              <div className="text-sm text-gray-600 mb-1">Hours per week</div>
              <div className="font-semibold text-gray-900">
                {user.hoursPerWeek ||
                  user.availability ||
                  "More than 30 hrs/week"}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Languages</div>
              <div className="font-semibold text-gray-900">
                {user.languages || "English"}
                {user.languageLevel && (
                  <span className="text-gray-500 text-sm ml-1">
                    {user.languageLevel}
                  </span>
                )}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Hourly Rate</div>
              <div className="font-semibold text-gray-900">
                {user.hourlyRate
                  ? `$${user.hourlyRate}/hr`
                  : user.rate
                  ? `$${user.rate}/hr`
                  : "Rate not specified"}
              </div>
            </div>
          </div>

          {/* Education Quick Info */}
          {user.education && (
            <div className="mt-6">
              <div className="text-sm text-gray-600 mb-1">Education</div>
              {Array.isArray(user.education) && user.education.length > 0 ? (
                <>
                  <div className="font-semibold text-gray-900">
                    {user.education[0].institution || user.education[0].school}
                  </div>
                  <div className="text-sm text-gray-600">
                    {user.education[0].degree || user.education[0].field}
                  </div>
                  <div className="text-sm text-gray-500">
                    {user.education[0].years ||
                      (user.education[0].startYear && user.education[0].endYear
                        ? `${user.education[0].startYear}-${user.education[0].endYear}`
                        : "")}
                  </div>
                </>
              ) : typeof user.education === "object" ? (
                <>
                  <div className="font-semibold text-gray-900">
                    {user.education.institution || user.education.school}
                  </div>
                  <div className="text-sm text-gray-600">
                    {user.education.degree || user.education.field}
                  </div>
                  <div className="text-sm text-gray-500">
                    {user.education.years ||
                      (user.education.startYear && user.education.endYear
                        ? `${user.education.startYear}-${user.education.endYear}`
                        : "")}
                  </div>
                </>
              ) : null}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              {user.title && (
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {user.title}
                </h2>
              )}
              {user.bio ? (
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {user.bio}
                </div>
              ) : (
                <div className="text-gray-500 italic">No bio available</div>
              )}
            </div>

            {/* Portfolio Section */}
            {user.portfolio && user.portfolio.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  Portfolio
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {user.portfolio.map((project, idx) => (
                    <div key={idx} className="group cursor-pointer">
                      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-3 shadow-sm">
                        {project.image || project.thumbnail ? (
                          <img
                            src={project.image || project.thumbnail}
                            alt={project.name || project.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                            <span className="text-gray-500 text-2xl font-bold">
                              {(project.name || project.title)?.charAt(0) ||
                                "P"}
                            </span>
                          </div>
                        )}
                      </div>
                      <h4 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                        {project.name || project.title || `Project ${idx + 1}`}
                      </h4>
                      {project.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {project.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills Section */}
            {user.skills && user.skills.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors cursor-default font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Work History */}
            {user.workHistory && user.workHistory.length > 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Work History
                </h3>
                <div className="space-y-4">
                  {user.workHistory.map((work, idx) => (
                    <div key={idx}>
                      <div className="font-semibold text-gray-900">
                        {work.title || work.position}
                      </div>
                      <div className="text-sm text-gray-600">
                        {work.company || work.employer}
                      </div>
                      <div className="text-sm text-gray-500">
                        {work.duration ||
                          (work.startDate && work.endDate
                            ? `${work.startDate} - ${work.endDate}`
                            : work.startDate || "")}
                      </div>
                      {work.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {work.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Work History
                </h3>
                <div className="text-sm text-gray-500">
                  No work history added yet
                </div>
              </div>
            )}

            {/* Certifications */}
            {user.certifications && user.certifications.length > 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Certifications
                </h3>
                <div className="space-y-3">
                  {user.certifications.map((cert, idx) => (
                    <div key={idx} className="text-sm">
                      <div className="font-medium text-gray-900">
                        {cert.name || cert.title}
                      </div>
                      <div className="text-gray-600">
                        {cert.issuer || cert.organization}
                      </div>
                      {cert.date && (
                        <div className="text-gray-500">{cert.date}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Certifications
                </h3>
                <div className="text-sm text-gray-500">
                  No certifications added yet
                </div>
              </div>
            )}

            {/* Contact */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Contact
              </h3>
              <div className="text-sm text-gray-700 space-y-2">
                {user.email && (
                  <div>
                    <span className="font-medium text-gray-600">Email: </span>
                    <span>{user.email}</span>
                  </div>
                )}
                {user.phone && (
                  <div>
                    <span className="font-medium text-gray-600">Phone: </span>
                    <span>{user.phone}</span>
                  </div>
                )}
                {user.website && (
                  <div>
                    <span className="font-medium text-gray-600">Website: </span>
                    <a
                      href={user.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:underline"
                    >
                      {user.website}
                    </a>
                  </div>
                )}
                {!user.email && !user.phone && !user.website && (
                  <div className="text-gray-500">No contact info provided</div>
                )}
              </div>
            </div>

            {/* User Type Badge */}
            {user.userType && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Account Type
                </h3>
                <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {user.userType}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
