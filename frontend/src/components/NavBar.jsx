import React from "react";
import { IoHelp } from "react-icons/io5";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from "@radix-ui/react-dialog";
import { IoNotificationsOutline } from "react-icons/io5";
import { useTheme } from "../components/ThemeProvider";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/workerSlice";
import { toast } from "react-toastify";
import axios from "axios";
import { API_URL } from "../config";

const NavBar = () => {
  const { theme, toggleTheme } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.worker);

  // Determine user type
  const isClient = user?.userType === "client";
  const isWorker = user?.userType === "worker";
  const location = useLocation();
  const isActivePath = (path) => {
    return location.pathname === path;
  };
  const handleLogout = async () => {
    try {
      // Call logout API to clear server-side session
      await axios.post(
        `${API_URL}/api/v1/user/logout`,
        {},
        {
          withCredentials: true,
        }
      );

      // Clear Redux state
      dispatch(logout());

      // Show success message
      toast.success("Logged out successfully");

      // Navigate to landing page
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      // Even if server logout fails, clear local state
      dispatch(logout());
      toast.success("Logged out successfully");
      navigate("/");
    }
  };

  const handleDashboardClick = () => {
    if (isClient) {
      navigate("/client-dashboard");
    } else if (isWorker) {
      navigate("/worker-dashboard");
    }
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-3 max-w-7xl">
        <div className="flex items-center justify-between relative">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link to="/home" className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg font-bold text-lg shadow-md">
                WORKMATE
              </div>
            </Link>

            {/* Navigation Links */}
            {/* Update the navigation links section with dynamic classes */}
            <div className="hidden md:flex items-center space-x-6">
              <button
                onClick={handleDashboardClick}
                className={`text-gray-700 font-medium transition-colors duration-200 border-b-2 pb-1 ${
                  isActivePath("/client-dashboard") ||
                  isActivePath("/worker-dashboard")
                    ? "text-blue-600 border-blue-600"
                    : "border-transparent hover:text-blue-600 hover:border-blue-600"
                }`}
              >
                {isClient ? "Client Dashboard" : "Worker Dashboard"}
              </button>

              {/* Conditional Navigation based on user type */}
              {isClient ? (
                <>
                  <Link
                    to="/postjob"
                    className={`text-gray-700 font-medium transition-colors duration-200 border-b-2 pb-1 ${
                      isActivePath("/postjob")
                        ? "text-blue-600 border-blue-600"
                        : "border-transparent hover:text-blue-600 hover:border-blue-600"
                    }`}
                  >
                    Post Job
                  </Link>
                  <Link
                    to="/home"
                    className={`text-gray-700 font-medium transition-colors duration-200 border-b-2 pb-1 ${
                      isActivePath("/")
                        ? "text-blue-600 border-blue-600"
                        : "border-transparent hover:text-blue-600 hover:border-blue-600"
                    }`}
                  >
                    My Jobs
                  </Link>
                  <Link
                    to="/home"
                    className={`text-gray-700 font-medium transition-colors duration-200 border-b-2 pb-1 ${
                      isActivePath("/fi")
                        ? "text-blue-600 border-blue-600"
                        : "border-transparent hover:text-blue-600 hover:border-blue-600"
                    }`}
                  >
                    Find Workers
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/home"
                    className={`text-gray-700 font-medium transition-colors duration-200 border-b-2 pb-1 ${
                      isActivePath("/home")
                        ? "text-blue-600 border-blue-600"
                        : "border-transparent hover:text-blue-600 hover:border-blue-600"
                    }`}
                  >
                    Find Work
                  </Link>
                  <Link
                    to="/worker-dashboard"
                    className={`text-gray-700 font-medium transition-colors duration-200 border-b-2 pb-1 ${
                      isActivePath("/worker-dashboard")
                        ? "text-blue-600 border-blue-600"
                        : "border-transparent hover:text-blue-600 hover:border-blue-600"
                    }`}
                  >
                    My Applications
                  </Link>
                  <Link
                    to="/worker-dashboard"
                    className={`text-gray-700 font-medium transition-colors duration-200 border-b-2 pb-1 ${
                      isActivePath("/earnings")
                        ? "text-blue-600 border-blue-600"
                        : "border-transparent hover:text-blue-600 hover:border-blue-600"
                    }`}
                  >
                    Earnings
                  </Link>
                </>
              )}

              <Link
                to="/message"
                className={`text-gray-700 font-medium transition-colors duration-200 border-b-2 pb-1 ${
                  isActivePath("/message")
                    ? "text-blue-600 border-blue-600"
                    : "border-transparent hover:text-blue-600 hover:border-blue-600"
                }`}
              >
                Messages
              </Link>
            </div>
          </div>

          {/* Search and Actions */}
          <div className="flex items-center space-x-4">
            {/* Search Box */}
            <div className="hidden sm:flex items-center bg-gray-100 rounded-lg px-4 py-2 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500 transition-all duration-200 min-w-0">
              <input
                type="text"
                placeholder={isClient ? "Search workers..." : "Search jobs..."}
                className="bg-transparent outline-none text-gray-700 placeholder-gray-500 w-28 sm:w-40 lg:w-56 flex-shrink"
              />
              <span className="text-gray-500 text-sm ml-2 flex-shrink-0">
                {isClient ? "workers" : "jobs"}
              </span>
            </div>

            {/* Action Icons */}
            <div className="flex items-center space-x-3 flex-shrink-0">
              {/* <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                <IoHelp className="w-5 h-5" />
              </button>
              */}
              <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 relative">
                <IoNotificationsOutline className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  3
                </span>
              </button>

              {/* User Avatar */}
              <div className="relative">
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-300 hover:border-blue-500 transition-colors duration-200">
                        {user?.profilePicture ? (
                          <img
                            src={user.profilePicture}
                            alt="User Avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-lg">
                              {user?.firstName?.charAt(0) ||
                                user?.name?.charAt(0) ||
                                "U"}
                            </span>
                          </div>
                        )}
                      </div>
                    </button>
                  </DialogTrigger>

                  <DialogContent className="w-64 bg-white rounded-xl shadow-xl border border-gray-200 p-4 mt-2 absolute right-0 z-50">
                    <div className="space-y-2">
                      {/* User Info */}
                      <div className="pb-3 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden">
                            {user?.profilePicture ? (
                              <img
                                src={user.profilePicture}
                                alt="User Avatar"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                                <span className="text-blue-600 font-semibold text-lg">
                                  {user?.firstName?.charAt(0) ||
                                    user?.name?.charAt(0) ||
                                    "U"}
                                </span>
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {user?.firstName && user?.lastName
                                ? `${user.firstName} ${user.lastName}`
                                : user?.name || "User"}
                            </p>
                            <p className="text-sm text-gray-500 capitalize">
                              {user?.userType || "User"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <Link
                        // to={`/profile${
                        //   user?.userType === "client" ? `/${user?._id}` : ""
                        // }`}
                        to={`/profile`}
                      >
                        <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
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
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                          </div>
                          <span className="font-medium text-gray-700">
                            Profile
                          </span>
                        </div>
                      </Link>

                      <button
                        onClick={toggleTheme}
                        className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200 w-full text-left"
                      >
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
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
                              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                            />
                          </svg>
                        </div>
                        <span className="font-medium text-gray-700">
                          {theme === "light" ? "Dark Mode" : "Light Mode"}
                        </span>
                      </button>

                      <div className="border-t border-gray-200 pt-2">
                        <Button
                          variant="destructive"
                          className="w-full justify-start bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                          onClick={handleLogout}
                        >
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                          Logout
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
