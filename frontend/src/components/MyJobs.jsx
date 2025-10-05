import React, { useEffect, useState } from "react";
import api from "../lib/axios";
import { useDispatch, useSelector } from "react-redux";
import {
  setMyJobs,
  updateJobInList,
  updateApplicantInJob,
  updateApplicationStatusGlobally,
} from "../redux/workerSlice";
import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";

const MyJobs = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const myJobs = useSelector((s) => s.worker.myJobs || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await api.get("/job/myjobs");
        if (mounted && res.data?.success) {
          dispatch(setMyJobs(res.data.data || []));
        }
      } catch (err) {
        console.error("fetch my jobs", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetch();
    return () => (mounted = false);
  }, [dispatch]);

  const changeApplicant = async (jobId, applicantId, status) => {
    try {
      const res = await api.patch(`/job/applicant/${jobId}/${applicantId}`, {
        status,
      });
      if (res.data?.success) {
        const updatedJob = res.data.data?.job;
        if (updatedJob) dispatch(updateJobInList(updatedJob));

        const applicant = (updatedJob?.applicants || []).find(
          (x) => String(x._id) === String(applicantId)
        );
        const workerId = applicant?.worker?._id || applicant?.worker;
        if (workerId) {
          dispatch(
            updateApplicationStatusGlobally({ jobId, workerId, status })
          );
        }
      }
    } catch (err) {
      console.error("update applicant", err);
    }
  };

  const changeJobStatus = async (jobId, status) => {
    try {
      const res = await api.patch(`/job/status/${jobId}`, { status });
      if (res.data?.success) {
        dispatch(updateJobInList(res.data.data));
      }
    } catch (err) {
      console.error("update job status", err);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">My Jobs</h2>
        <div className="text-sm text-gray-600">{myJobs.length} jobs</div>
      </div>

      {myJobs.length === 0 ? (
        <div className="text-center py-12 text-gray-600">
          You haven't posted any jobs yet.
        </div>
      ) : (
        <div className="space-y-4">
          {myJobs.map((job) => (
            <div
              key={job._id}
              className="bg-white border rounded-lg shadow-sm p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{job.title}</h3>
                  <div className="text-sm text-gray-500">
                    {job.location} • ₹{job.prize}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/jobdetail/${job._id}`)}
                    className="px-3 py-1 bg-blue-600 text-white rounded"
                  >
                    View
                  </button>
                  <button
                    onClick={() =>
                      changeJobStatus(
                        job._id,
                        job.status === "open" ? "closed" : "open"
                      )
                    }
                    className="px-3 py-1 border rounded"
                  >
                    {job.status === "open" ? "Close" : "Reopen"}
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="font-medium">
                  Applicants ({(job.applicants || []).length})
                </h4>
                <div className="mt-2 space-y-2">
                  {(job.applicants || []).map((a) => (
                    <div
                      key={a._id || a.worker}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <div>
                        <div className="font-medium">
                          {a.worker?.firstName
                            ? `${a.worker.firstName} ${a.worker.lastName || ""}`
                            : a.worker?._id || "Worker"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {a.coverLetter || "No cover letter"}
                        </div>
                        <div className="text-xs text-gray-400">
                          Status: {a.status}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            changeApplicant(job._id, a._id || a._id, "accepted")
                          }
                          className="px-2 py-1 bg-green-600 text-white rounded"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() =>
                            changeApplicant(job._id, a._id || a._id, "rejected")
                          }
                          className="px-2 py-1 bg-red-600 text-white rounded"
                        >
                          Reject
                        </button>
                        <button
                          title="Open chat"
                          onClick={() =>
                            navigate(
                              `/message`
                            )
                          }
                          className="px-2 py-1 border rounded flex items-center gap-1"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyJobs;
