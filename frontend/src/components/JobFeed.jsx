import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config";
import Job from "./Job";

const JobFeed = ({ onJobSelect }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/v1/job/getjobs`, {
          withCredentials: true,
        });
        setJobs(res.data.jobs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleJobSelect = (jobId) => {
    if (onJobSelect) {
      onJobSelect(jobId);
    }
  };

  if (loading) {
    return (
      <div className="space-y-2 sm:space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-gray-100 rounded-lg p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
            <div className="flex justify-between">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/6"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-12 h-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">
          No jobs found
        </h3>
        <p className="text-gray-500">Check back later for new opportunities</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 ">
      {jobs.map((job) => (
        <Job
          key={job._id}
          job={job}
          onSelect={() => handleJobSelect(job._id)}
        />
      ))}
    </div>
  );
};

export default JobFeed;
