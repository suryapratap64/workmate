import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import {
  Plus,
  Search,
  Filter,
  MessageSquare,
  DollarSign,
  Users,
  Briefcase,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import api from "../lib/axios";
import { setMyJobs } from "../redux/workerSlice";

const ClientDashboard = () => {
  const { user, myJobs = [] } = useSelector((state) => state.worker);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [recentWorkers, setRecentWorkers] = useState([]);

  const stats = {
    totalJobs: 15,
    activeJobs: 8,
    completedJobs: 7,
    totalSpent: "$12,450",
    thisMonth: "$2,300",
  };

  useEffect(() => {
    // fetch jobs posted by this client
    let mounted = true;
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await api.get("/job/myjobs");
        if (!mounted) return;
        if (res.data?.success) {
          const jobs = res.data.data || [];
          dispatch(setMyJobs(jobs));

          // derive recent workers from applicants across jobs (most recent first)
          const applicants = [];
          for (const job of jobs) {
            (job.applicants || []).forEach((a) => {
              const worker = a.worker || {};
              applicants.push({
                workerId: worker._id || worker,
                firstName: worker.firstName,
                lastName: worker.lastName,
                profilePicture: worker.profilePicture,
                appliedAt: a.appliedAt,
                jobTitle: job.title,
                jobId: job._id,
              });
            });
          }
          applicants.sort(
            (x, y) => new Date(y.appliedAt) - new Date(x.appliedAt)
          );
          // unique by workerId, keep latest
          const seen = new Set();
          const recent = [];
          for (const a of applicants) {
            if (!a.workerId) continue;
            if (seen.has(String(a.workerId))) continue;
            seen.add(String(a.workerId));
            recent.push(a);
            if (recent.length >= 5) break;
          }
          setRecentWorkers(recent);
        }
      } catch (err) {
        console.error("fetch client jobs", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetch();
    return () => (mounted = false);
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Client Dashboard
              </h1>
              <p className="text-gray-600">Welcome back, {user?.firstName}!</p>
            </div>
            <div className="flex gap-3">
              <Link to="/postjob">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Post a Job
                </Button>
              </Link>
              <Link to="/message">
                <Button variant="outline">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Messages
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
              <div className="p-2 bg-blue-100 rounded-lg">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalJobs}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.activeJobs}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalSpent}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.thisMonth}
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
                  {/* Recent Jobs */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Recent Jobs
                    </h3>
                    <div className="space-y-3">
                      {(myJobs || []).slice(0, 3).map((job) => (
                        <div
                          key={job._id}
                          className="bg-gray-50 rounded-lg p-4"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {job.title}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {job.location || ""}
                              </p>
                              <div className="flex items-center mt-2">
                                <span className="text-sm text-gray-500">
                                  {job.createdAt
                                    ? new Date(
                                        job.createdAt
                                      ).toLocaleDateString()
                                    : ""}
                                </span>
                                <span className="mx-2">•</span>
                                <span className="text-sm font-medium text-green-600">
                                  ₹{job.prize}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  job.status === "open"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {job.status}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  navigate(`/jobdetail/${job._id}`)
                                }
                              >
                                View
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Workers */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Recent Workers
                    </h3>
                    <div className="space-y-3">
                      {recentWorkers.map((w) => (
                        <div
                          key={w.workerId}
                          className="bg-gray-50 rounded-lg p-4"
                        >
                          <div className="flex items-center space-x-3">
                            {w.profilePicture ? (
                              <img
                                src={w.profilePicture}
                                alt={`${w.firstName}`}
                                className="w-10 h-10 rounded-full"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                                {(w.firstName || "")[0] || "U"}
                              </div>
                            )}
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">
                                {w.firstName} {w.lastName}
                              </h4>
                              <div className="text-sm text-gray-600 mt-1">
                                Applied to: {w.jobTitle}
                              </div>
                              <div className="text-xs text-gray-500">
                                {w.appliedAt
                                  ? new Date(w.appliedAt).toLocaleString()
                                  : ""}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/user/${w.workerId}`)}
                              >
                                Profile
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  navigate(
                                    `/message`
                                  )
                                }
                              >
                                Message
                              </Button>
                            </div>
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

export default ClientDashboard;
