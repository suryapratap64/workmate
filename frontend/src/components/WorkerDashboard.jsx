import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import {
  Search,
  Filter,
  MessageSquare,
  DollarSign,
  Briefcase,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  MapPin,
  Calendar,
  Eye,
  Bookmark,
} from "lucide-react";
import { useSelector } from "react-redux";

const WorkerDashboard = () => {
  const { user } = useSelector((state) => state.worker);
  const [activeTab, setActiveTab] = useState("overview");
  const [jobs, setJobs] = useState([
    {
      id: 1,
      title: "React Developer for E-commerce App",
      client: "TechCorp Inc.",
      budget: "$3000",
      duration: "2-3 months",
      skills: ["React", "Node.js", "MongoDB"],
      location: "Remote",
      posted: "2 hours ago",
      applications: 15,
      type: "Fixed Price",
      description:
        "We need a skilled React developer to build an e-commerce application...",
    },
    {
      id: 2,
      title: "UI/UX Designer for Mobile App",
      client: "StartupXYZ",
      budget: "$1500",
      duration: "3-4 weeks",
      skills: ["Figma", "Adobe XD", "Prototyping"],
      location: "Remote",
      posted: "1 day ago",
      applications: 8,
      type: "Fixed Price",
      description:
        "Looking for a creative UI/UX designer to redesign our mobile app...",
    },
  ]);

  const [myApplications, setMyApplications] = useState([
    {
      id: 1,
      jobTitle: "Full Stack Developer",
      client: "Digital Solutions",
      status: "under-review",
      applied: "3 days ago",
      budget: "$2500",
    },
    {
      id: 2,
      jobTitle: "WordPress Developer",
      client: "Web Agency",
      status: "accepted",
      applied: "1 week ago",
      budget: "$800",
    },
  ]);

  const stats = {
    totalEarnings: "$8,450",
    thisMonth: "$1,200",
    completedJobs: 12,
    activeJobs: 3,
    responseRate: "95%",
    avgRating: 4.8,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <Link to="/home">
                <h1 className="text-2xl font-bold text-gray-900">
                  Worker Dashboard
                </h1>
              </Link>
              <p className="text-gray-600">Welcome back, {user?.firstName}!</p>
            </div>
            <div className="flex gap-3">
              <Link to="/message">
                <Button variant="outline">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Messages
                </Button>
              </Link>
              <Link to="/profile">
                <Button variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  View Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Earnings
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalEarnings}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.thisMonth}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Completed Jobs
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.completedJobs}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Star className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.avgRating}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Applications */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Recent Applications
                    </h3>
                    <div className="space-y-3">
                      {myApplications.slice(0, 3).map((application) => (
                        <div
                          key={application.id}
                          className="bg-gray-50 rounded-lg p-4"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {application.jobTitle}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {application.client}
                              </p>
                              <div className="flex items-center mt-2">
                                <span className="text-sm text-gray-500">
                                  {application.applied}
                                </span>
                                <span className="mx-2">•</span>
                                <span className="text-sm font-medium text-green-600">
                                  {application.budget}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  application.status === "accepted"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {application.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommended Jobs */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Recommended Jobs
                    </h3>
                    <div className="space-y-3">
                      {jobs.slice(0, 3).map((job) => (
                        <div key={job.id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {job.title}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {job.client}
                              </p>
                              <div className="flex items-center mt-2">
                                <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                                <span className="text-sm text-gray-500">
                                  {job.location}
                                </span>
                                <span className="mx-2">•</span>
                                <span className="text-sm font-medium text-green-600">
                                  {job.budget}
                                </span>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">
                              Apply
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerDashboard;
