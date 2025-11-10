import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import JobList from "./JobFeed";
import RightBar from "./RightBar";
import JobDetail from "./JobDetail";

const Home = () => {
  const location = useLocation();
  const [selectedJobId, setSelectedJobId] = useState(null);

  // Check if we're on a job detail page
  const isJobDetailPage = location.pathname.startsWith("/jobdetail/");
  const jobIdFromUrl = location.pathname.split("/jobdetail/")[1];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main content area */}
      <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col xl:flex-row gap-6">
          {/* Left Sidebar - Job Feed */}
          <div className="w-full xl:w-3/4">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 py-4">
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  Available Jobs
                </h1>
                <p className="text-blue-100 mt-1 text-sm sm:text-base">Find your next opportunity</p>
              </div>
              <div className="p-4 sm:p-6">
                <JobList onJobSelect={setSelectedJobId} />
              </div>
            </div>
          </div>

          {/* Right Sidebar - Job Detail or Profile */}
          <div className="w-full xl:w-1/4">
            {isJobDetailPage || selectedJobId ? (
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden sticky top-4">
                <div className="bg-gradient-to-r from-green-600 to-green-700 px-4 sm:px-6 py-4">
                  <h2 className="text-lg sm:text-xl font-bold text-white">Job Details</h2>
                  <p className="text-green-100 text-xs sm:text-sm mt-1">
                    View job information
                  </p>
                </div>
                <div className="p-4 sm:p-6">
                  <JobDetail jobId={jobIdFromUrl || selectedJobId} />
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden sticky top-4">
                <div className="bg-gradient-to-r from-green-600 to-green-700 px-4 sm:px-6 py-4">
                  <h2 className="text-lg sm:text-xl font-bold text-white">Profile</h2>
                  <p className="text-green-100 text-xs sm:text-sm mt-1">
                    Manage your account
                  </p>
                </div>
                <div className="p-4 sm:p-6">
                  <RightBar />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Outlet for nested routes */}
        <div className="mt-6 max-w-[2000px]">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Home;
