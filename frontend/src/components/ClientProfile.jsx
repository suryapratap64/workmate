import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Button } from "./ui/button";
import {
  FaMapMarkerAlt,
  FaClock,
  FaDollarSign,
  FaBriefcase,
  FaGlobe,
  FaLinkedin,
  FaTwitter,
  FaStar,
  FaCheckCircle,
  FaRegClock,
  FaRegMoneyBillAlt,
  FaBuilding,
  FaIndustry,
} from "react-icons/fa";
import axios from "axios";

const ClientProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClientProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          `http://localhost:8000/api/v1/user/client/${id}`,
          {
            withCredentials: true,
          }
        );

        if (response.data.success) {
          setClient(response.data.client);
        } else {
          setError(response.data.message || "Failed to fetch client profile");
        }
      } catch (error) {
        console.error("Error fetching client profile:", error);
        setError(
          error.response?.data?.message || "Failed to fetch client profile"
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchClientProfile();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">
            {error || "Client profile not found"}
          </h2>
          <p className="text-gray-600 mb-4">
            {error
              ? "There was an error loading the client profile."
              : "The client profile you're looking for doesn't exist."}
          </p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

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
                  src={
                    client.profilePicture || "https://via.placeholder.com/150"
                  }
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover"
                />
                <AvatarFallback className="w-24 h-24 text-2xl">
                  {client.firstName?.[0]}
                  {client.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {client.firstName} {client.lastName}
                </h1>
                <p className="text-lg text-gray-600">Client</p>
                {client.location && (
                  <div className="flex items-center gap-2 mt-2">
                    <FaMapMarkerAlt className="text-gray-400" />
                    <span className="text-gray-600">{client.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2"
              >
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            {client.bio && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  About
                </h2>
                <p className="text-gray-700 leading-relaxed">{client.bio}</p>
              </div>
            )}

            {/* Company Information */}
            {(client.companyName || client.industry) && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Company Information
                </h2>
                <div className="space-y-4">
                  {client.companyName && (
                    <div className="flex items-center gap-3">
                      <FaBuilding className="text-blue-600 w-5 h-5" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {client.companyName}
                        </p>
                        <p className="text-sm text-gray-600">Company Name</p>
                      </div>
                    </div>
                  )}
                  {client.companySize && (
                    <div className="flex items-center gap-3">
                      <FaBriefcase className="text-green-600 w-5 h-5" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {client.companySize}
                        </p>
                        <p className="text-sm text-gray-600">Company Size</p>
                      </div>
                    </div>
                  )}
                  {client.industry && (
                    <div className="flex items-center gap-3">
                      <FaIndustry className="text-purple-600 w-5 h-5" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {client.industry}
                        </p>
                        <p className="text-sm text-gray-600">Industry</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Social Links */}
            {client.socialLinks && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Social Links
                </h2>
                <div className="space-y-3">
                  {client.socialLinks.linkedin && (
                    <a
                      href={client.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <FaLinkedin className="w-5 h-5" />
                      <span>LinkedIn</span>
                    </a>
                  )}
                  {client.socialLinks.website && (
                    <a
                      href={client.socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-green-600 hover:text-green-800 transition-colors"
                    >
                      <FaGlobe className="w-5 h-5" />
                      <span>Website</span>
                    </a>
                  )}
                  {client.socialLinks.twitter && (
                    <a
                      href={client.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-blue-400 hover:text-blue-600 transition-colors"
                    >
                      <FaTwitter className="w-5 h-5" />
                      <span>Twitter</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Client Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FaRegMoneyBillAlt className="text-green-600 w-5 h-5" />
                    <span className="text-gray-700">Total Spent</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    ₹{client.totalSpent || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FaBriefcase className="text-blue-600 w-5 h-5" />
                    <span className="text-gray-700">Jobs Posted</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {client.postedJobs || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FaRegClock className="text-purple-600 w-5 h-5" />
                    <span className="text-gray-700">Hired Workers</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {client.hiredWorkers || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Verification */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Verification
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <FaCheckCircle className="text-green-600 w-5 h-5" />
                  <span className="text-sm text-gray-700">
                    Payment verified
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <FaCheckCircle className="text-green-600 w-5 h-5" />
                  <span className="text-sm text-gray-700">Phone verified</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className="w-4 h-4 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-700">5.0 (1 review)</span>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Contact Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">
                    {client.email || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium text-gray-900">
                    {client.mobileNumber || "Not provided"}
                  </p>
                </div>
                {client.location && (
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-medium text-gray-900">
                      {client.location}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientProfile;
