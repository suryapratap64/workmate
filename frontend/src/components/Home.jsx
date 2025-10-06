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
    <div className="min-h-screen   ">
      {/* Main content area */}
      <div className="container mx-auto lg:px-4 sm:py-6 ">
        <div className="flex flex-col  lg:flex-row gap-6">
          {/* Left Sidebar - Job Feed */}
          <div className="flex-1  lg:max-w-4xl">
            <div className="bg-white  rounded-sm shadow-lg border  border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r  from-blue-600 to-blue-700 px-6  py-4"> 
                <h1 className="text-2xl font-bold text-white">
                  Available Jobs
                </h1>
                <p className="text-blue-100 mt-1">Find your next opportunity</p>
              </div>
              <div className="p-6 sm:p-2 ">
                <JobList onJobSelect={setSelectedJobId} />
              </div>
            </div>
          </div>

          {/* Right Sidebar - Job Detail or Profile */}
          <div className="w-full lg:w-80 flex-shrink-0">
            {isJobDetailPage || selectedJobId ? (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
                  <h2 className="text-xl font-bold text-white">Job Details</h2>
                  <p className="text-green-100 text-sm mt-1">
                    View job information
                  </p>
                </div>
                <div className="p-4 sm:p-6">
                  <JobDetail jobId={jobIdFromUrl || selectedJobId} />
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-sm shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
                  <h2 className="text-xl font-bold text-white">Profile</h2>
                  <p className="text-green-100 text-sm mt-1">
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
        <div className="mt-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Home;
