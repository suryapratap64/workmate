import React, { useEffect, useState } from "react";
import api from "../lib/axios";
import { useDispatch, useSelector } from "react-redux";
import { setWorkers, setSelectedWorker } from "../redux/workerSlice";
import { useNavigate } from "react-router-dom";

const WorkerCard = ({ w, onView }) => (
  <div className="border rounded-lg p-4 shadow-sm flex items-start gap-4">
    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
      {w.profilePicture ? (
        <img
          src={w.profilePicture}
          alt="avatar"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="text-xl font-semibold text-gray-600">
          {w.firstName?.charAt(0) || "U"}
        </div>
      )}
    </div>
    <div className="flex-1">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">
            {w.firstName} {w.lastName}
          </h3>
          <div className="text-sm text-gray-500">
            {w.country} • {w.state}
          </div>
        </div>
        <div className="text-right">
          <div className="text-green-600 font-semibold">
            ₹{w.hourlyRate || "0"}
          </div>
          <div className="text-sm text-gray-500">{w.rating || 0} ★</div>
        </div>
      </div>
      <p className="mt-2 text-sm text-gray-600">{w.bio || "No bio yet"}</p>
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => onView(w)}
          className="px-3 py-1 bg-blue-600 text-white rounded"
        >
          View Profile
        </button>
        <button className="px-3 py-1 border rounded">Message</button>
      </div>
    </div>
  </div>
);

const FindWorkers = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const workers = useSelector((s) => s.worker.workers) || [];
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/user/workers?q=${encodeURIComponent(q)}&page=${page}&limit=12`
      );
      if (res.data?.success) {
        dispatch(setWorkers(res.data.data.workers || []));
      }
    } catch (err) {
      console.error("fetchWorkers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, [q, page]);

  const handleView = (worker) => {
    dispatch(setSelectedWorker(worker));
    navigate(`/user/${worker._id}`);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search workers by name, skills, bio..."
          className="flex-1 p-3 border rounded"
        />
        <button onClick={() => setQ("")} className="px-4 py-2 border rounded">
          Clear
        </button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workers.map((w) => (
            <WorkerCard key={w._id} w={w} onView={handleView} />
          ))}
        </div>
      )}

      <div className="mt-6 flex justify-between">
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="px-4 py-2 border rounded"
        >
          Prev
        </button>
        <button
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 border rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default FindWorkers;
