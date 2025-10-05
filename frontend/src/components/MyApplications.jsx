import React, { useEffect, useState } from "react";
import api from "../lib/axios";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setApplications } from "../redux/workerSlice";
import { MessageCircle, MapPin, DollarSign } from "lucide-react";

const statusColor = (s) => {
  if (!s) return "bg-gray-100 text-gray-700";
  if (s === "applied") return "bg-blue-100 text-blue-700";
  if (s === "accepted") return "bg-green-100 text-green-700";
  if (s === "rejected") return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-700";
};

const MyApplications = () => {
  const [loading, setLoading] = useState(false);
  const apps = useSelector((s) => s.worker.applications || []);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await api.get("/job/myapplications");
        if (mounted && res.data?.success)
          dispatch(setApplications(res.data.data || []));
      } catch (err) {
        console.error("fetch my applications", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetch();
    return () => (mounted = false);
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">My Applications</h2>
        <div className="text-sm text-gray-600">{apps.length} applications</div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : apps.length === 0 ? (
        <div className="text-center py-12 text-gray-600">
          You haven't applied to any jobs yet.
        </div>
      ) : (
        <div className="space-y-4">
          {apps.map((job) => (
            <div
              key={job._id}
              className="bg-white border rounded-lg shadow-sm p-4 flex gap-4 items-start"
            >
              <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                {job.client?.profilePicture ? (
                  <img
                    src={job.client.profilePicture}
                    alt="client"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-xl font-semibold text-gray-600">
                    {job.client?.firstName?.[0] || "C"}
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {job.title}
                    </h3>
                    <div className="text-sm text-gray-500 mt-1">
                      {job.client?.firstName} {job.client?.lastName}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-2">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />₹{job.prize}
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusColor(
                        job.myApplication?.status
                      )}`}
                    >
                      {job.myApplication?.status || "applied"}
                    </div>
                    <div className="text-xs text-gray-400 mt-2">
                      Applied:{" "}
                      {new Date(job.myApplication?.appliedAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                {job.myApplication?.coverLetter && (
                  <p className="mt-3 text-sm text-gray-700 line-clamp-2">
                    {job.myApplication.coverLetter}
                  </p>
                )}

                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={() => navigate(`/jobdetail/${job._id}`)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md"
                  >
                    View Job
                  </button>
                  <button
                    onClick={() => navigate(`/message`)}
                    className="px-4 py-2 border rounded-md flex items-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Message
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyApplications;
