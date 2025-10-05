import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import axios from "axios";
import {
  ArrowLeft,
  Heart,
  Flag,
  Star,
  MapPin,
  Clock,
  DollarSign,
  CheckCircle,
  Phone,
  Calendar,
  Users,
  Briefcase,
  TrendingUp,
  MessageCircle,
} from "lucide-react";
import { API_URL } from "@/config";
import api from "../lib/axios";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { addApplication } from "../redux/workerSlice";

const JobDetail = ({ jobId: propJobId }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const dispatch = useDispatch();
  const currentUser = useSelector((s) => s.worker.user);

  // normalize current user id for comparisons
  const currentUserId =
    currentUser?._id || currentUser?.userId || currentUser?.id || null;

  // Use jobId from props if provided, otherwise use URL param
  const jobId = propJobId || id;

  useEffect(() => {
    const fetchJobDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          `${API_URL}/api/v1/job/getjob/${jobId}`,
          {
            withCredentials: true,
          }
        );

        if (response.data.success) {
          setJob(response.data.job);
        } else {
          setError(response.data.message || "Failed to fetch job details");
        }
      } catch (error) {
        console.error("Error fetching job details:", error);
        setError(
          error.response?.data?.message || "Failed to fetch job details"
        );
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchJobDetail();
    }
  }, [jobId]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-600 mb-2">
            {error || "Job not found"}
          </h2>
          <p className="text-gray-500">
            {error
              ? "There was an error loading the job details."
              : "The job you're looking for doesn't exist or has been removed."}
          </p>
          <Button
            onClick={() => navigate(-1)}
            className="mt-4"
            variant="outline"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        {/* <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <Heart className="w-4 h-4" />
              <span>Save</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <Flag className="w-4 h-4" />
              <span>Flag</span>
            </Button>
          </div>
        </div> */}

        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span>{job.location}</span>
            </div>
            {job.client && (
              <div className="flex items-center space-x-1">
                <span>•</span>
                <button
                  onClick={() => navigate(`/user/${job.client._id}`)}
                  className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                >
                  {job.client.firstName} {job.client.lastName}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Job Details */}
      <div className="p-6 space-y-6">
        {/* Description */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Description
          </h2>
          <p className="text-gray-700 leading-relaxed">{job.description}</p>
        </div>

        {/* Requirements */}
        {job.requirements && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Requirements
            </h2>
            <ul className="space-y-2">
              {job.requirements.map((req, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span className="text-gray-700">{req}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Project Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-gray-900">Budget</span>
            </div>
            <p className="text-2xl font-bold text-green-600">₹{job.prize}</p>
            <p className="text-sm text-gray-600">Fixed Price</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-gray-900">Duration</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">1-2 weeks</p>
            <p className="text-sm text-gray-600">Estimated</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span className="font-semibold text-gray-900">Experience</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">Expert</p>
            <p className="text-sm text-gray-600">Level Required</p>
          </div>
        </div>

        {/* Skills */}
        {job.skills && job.skills.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Skills Required
            </h2>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {(() => {
            // compare stringified ids to handle ObjectId vs string vs populated objects
            const hasApplied = !!job?.applicants?.some(
              (a) => String(a?.worker) === String(currentUserId)
            );

            return (
              <Button
                className={`w-full ${
                  hasApplied
                    ? "bg-gray-300 text-gray-800 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white"
                } py-3`}
                disabled={hasApplied}
                onClick={async () => {
                  try {
                    const res = await api.post(`/job/apply/${job._id}`, {
                      coverLetter: "",
                    });
                    if (res.data?.success) {
                      toast.success("Applied successfully");

                      // create updated job object with new applicant & myApplication
                      const newApplicant = {
                        worker: currentUserId,
                        coverLetter: "",
                        status: "applied",
                        appliedAt: new Date().toISOString(),
                      };

                      const updatedJob = {
                        ...job,
                        applicants: [...(job.applicants || []), newApplicant],
                        myApplication: newApplicant,
                      };

                      // update local state so UI immediately reflects applied status
                      setJob(updatedJob);

                      // update redux store (prepend)
                      dispatch(addApplication(updatedJob));
                    } else {
                      toast.error(res.data?.message || "Failed to apply");
                    }
                  } catch (err) {
                    console.error("apply error", err);
                    toast.error(
                      err.response?.data?.message || "Failed to apply"
                    );
                  }
                }}
              >
                {hasApplied ? "Already applied" : "Apply Now"}
              </Button>
            );
          })()}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() =>
                navigate(
                  `/start-conversation?jobId=${job._id}&clientId=${job.client._id}`
                )
              }
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Message Client
            </Button>
            <Button variant="outline" className="flex-1">
              <Heart className="w-4 h-4 mr-2" />
              Save Job
            </Button>
          </div>
        </div>

        {/* Client Information */}
        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            About the Client
          </h2>
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-700">Payment verified</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-700">
                Phone number verified
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-yellow-400 fill-current"
                  />
                ))}
              </div>
              <span className="text-sm text-gray-700">5.0 (1 review)</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Location:</span>
                <p className="font-medium">{job.location}</p>
              </div>
              <div>
                <span className="text-gray-600">Member since:</span>
                <p className="font-medium">Jun 2024</p>
              </div>
              <div>
                <span className="text-gray-600">Jobs posted:</span>
                <p className="font-medium">5 jobs</p>
              </div>
              <div>
                <span className="text-gray-600">Hire rate:</span>
                <p className="font-medium">80%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Job Images */}
        {job.images && job.images.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Project Images
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {job.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Project ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                  onClick={() => setSelectedImage(image)}
                />
              ))}
            </div>
          </div>
        )}
        {/* Image Modal */}
        {selectedImage && (
          <div
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 bg-white/50 bg-opacity-7 flex items-center justify-center z-50"
          >
            <div
              className="relative"
              onClick={(e) => e.stopPropagation()} // prevent closing when clicking on the image itself
            >
              <img
                src={selectedImage}
                alt="Selected"
                className="max-h-[80vh] max-w-[90vw] rounded-lg shadow-lg"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-2 right-2 bg-white rounded-full p-2 shadow hover:bg-gray-200"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetail;
