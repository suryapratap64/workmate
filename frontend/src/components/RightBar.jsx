import React from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { useSelector } from "react-redux";

const RightBar = () => {
  const { user } = useSelector((state) => state.worker);
  const isClient = user?.userType === "client";
  const isWorker = user?.userType === "worker";

  return (
    <div className="space-y-6">
      {/* Profile Section */}
      <div className="text-center">
        <Link
          to={`/profile`}
          className="block group"
        >
          <div className="flex flex-col items-center space-y-3">
            <Avatar className="w-20 h-20 group-hover:ring-4 group-hover:ring-blue-100 transition-all duration-200">
              <AvatarImage
                src={user?.profilePicture || ""}
                alt="Profile"
                className="w-full h-full object-cover rounded-full"
              />
              <AvatarFallback className="bg-blue-100 text-blue-600 text-xl font-semibold">
                {user?.firstName?.charAt(0) || user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>

            <div className="text-center">
              <h2 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                {user?.firstName && user?.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user?.name || "User"}
              </h2>
              <p className="text-sm text-gray-600 mt-1 capitalize">
                {user?.userType || "User"}
              </p>
            </div>
          </div>
        </Link>

        <Link
          to={"/profile"}
        >
          <div className="mt-4 inline-flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            <span>Complete Profile</span>
          </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>

        <div className="space-y-2">
          {isClient ? (
            // Client Actions
            <>
              <Link
                to="/postjob"
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 group"
              >
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors duration-200">
                  <svg
                    className="w-4 h-4 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <span className="font-medium text-gray-700 group-hover:text-green-600 transition-colors duration-200">
                  Post New Job
                </span>
              </Link>

              <Link
                to="/my-jobs"
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 group"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-200">
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <span className="font-medium text-gray-700 group-hover:text-blue-600 transition-colors duration-200">
                  My Jobs
                </span>
              </Link>

              <Link
                to="/find-workers"
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 group"
              >
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors duration-200">
                  <svg
                    className="w-4 h-4 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <span className="font-medium text-gray-700 group-hover:text-purple-600 transition-colors duration-200">
                  Find Workers
                </span>
              </Link>
            </>
          ) : (
            // Worker Actions
            <>
              <Link
                to="/"
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 group"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-200">
                  <svg
                    className="w-4 h-4 text-blue-600"
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
                <span className="font-medium text-gray-700 group-hover:text-blue-600 transition-colors duration-200">
                  Find Work
                </span>
              </Link>

              <Link
                to="/my-applications"
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 group"
              >
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors duration-200">
                  <svg
                    className="w-4 h-4 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <span className="font-medium text-gray-700 group-hover:text-green-600 transition-colors duration-200">
                  My Applications
                </span>
              </Link>

              <Link
                to="/earnings"
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 group"
              >
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center group-hover:bg-yellow-200 transition-colors duration-200">
                  <svg
                    className="w-4 h-4 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
                <span className="font-medium text-gray-700 group-hover:text-yellow-600 transition-colors duration-200">
                  Earnings
                </span>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          {isClient ? "This Month" : "This Month"}
        </h3>
        <div className="space-y-2">
          {isClient ? (
            // Client Stats
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Jobs Posted</span>
                <span className="text-sm font-semibold text-blue-600">8</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Jobs</span>
                <span className="text-sm font-semibold text-green-600">5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Spent</span>
                <span className="text-sm font-semibold text-green-600">
                  ₹12,400
                </span>
              </div>
            </>
          ) : (
            // Worker Stats
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Jobs Applied</span>
                <span className="text-sm font-semibold text-blue-600">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completed</span>
                <span className="text-sm font-semibold text-green-600">8</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Earnings</span>
                <span className="text-sm font-semibold text-green-600">
                  ₹15,400
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RightBar;
