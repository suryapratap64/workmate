import React, { useState } from "react";
// IoHelp removed (unused)
import Logo from "./ui/Logo";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@radix-ui/react-dialog";
import { useTheme } from "../context/ThemeContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/workerSlice";
import { toast } from "react-toastify";
import axios from "axios";
import { API_URL } from "../config";
import { FaUserCircle, FaMoon, FaSun, FaSignOutAlt } from "react-icons/fa";

const NavBar = () => {
  const { darkMode, toggleTheme, setLightMode } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
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

      // Reset theme to light on logout
      try {
        setLightMode();
      } catch (e) {
        // ignore if theme reset fails
        console.error("Failed to reset theme on logout:", e);
      }

      // Clear Redux state
      dispatch(logout());

      // Show success message
      toast.success("Logged out successfully");

      // Navigate to landing page
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      // Even if server logout fails, clear local state
      try {
        setLightMode();
      } catch (e) {
        console.error("Failed to reset theme on logout:", e);
      }
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
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50 w-full">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-1">
        <div className="flex items-center justify-between relative">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            {/* Mobile menu button (left on mobile) */}
            <button
              onClick={() => setMobileOpen((s) => !s)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-blue-50 mr-2"
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>

            {/* Logo */}
            <Link to="/home">
              <Logo />
            </Link>

            {/* Navigation Links */}
            {/* Update the navigation links section with dynamic classes */}
            <div className="hidden md:flex items-center space-x-6">
              <button
                onClick={handleDashboardClick}
                className={`text-gray-700 font-medium transition-colors duration-200 cursor-pointer  border-b-2 pb-1 ${
                  isActivePath("/client-dashboard") ||
                  isActivePath("/worker-dashboard")
                    ? "text-blue-600 border-blue-600"
                    : "border-transparent hover:text-blue-600 "
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
                        : "border-transparent hover:text-blue-600 "
                    }`}
                  >
                    Post Job
                  </Link>
                  <Link
                    to="/myjobs"
                    className={`text-gray-700 font-medium transition-colors duration-200 border-b-2 pb-1 ${
                      isActivePath("/myjobs")
                        ? "text-blue-600 border-blue-600"
                        : "border-transparent hover:text-blue-600 "
                    }`}
                  >
                    My Jobs
                  </Link>
                  <Link
                    to="/findworkers"
                    className={`text-gray-700 font-medium transition-colors duration-200 border-b-2 pb-1 ${
                      isActivePath("/findworkers")
                        ? "text-blue-600 border-blue-600"
                        : "border-transparent hover:text-blue-600 "
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
                        : "border-transparent hover:text-blue-600 "
                    }`}
                  >
                    Find Work
                  </Link>
                  <Link
                    to="/myapplication"
                    className={`text-gray-700 font-medium transition-colors duration-200 border-b-2 pb-1 ${
                      isActivePath("/myapplication")
                        ? "text-blue-600 border-blue-600"
                        : "border-transparent hover:text-blue-600 "
                    }`}
                  >
                    My Applications
                  </Link>
                  {/* <Link
                    to="/worker-dashboard"
                    className={`text-gray-700 font-medium transition-colors duration-200 border-b-2 pb-1 ${
                      isActivePath("/earnings")
                        ? "text-blue-600 border-blue-600"
                        : "border-transparent hover:text-blue-600 hover:border-blue-600"
                    }`}
                  >
                    Earnings
                  </Link> */}
                </>
              )}

              <Link
                to="/message"
                className={`text-gray-700 font-medium transition-colors duration-200 border-b-2 pb-1 ${
                  isActivePath("/message")
                    ? "text-blue-600 border-blue-600"
                    : "border-transparent hover:text-blue-600 "
                }`}
              >
                Messages
              </Link>
            </div>
          </div>

          {/* Search and Actions */}
          <div className="flex items-center space-x-4">
            {/* Search Box */}
            <div className="hidden sm:flex items-center  rounded-lg px-4 py-2 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500 transition-all duration-200 min-w-0">
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
              {/* User Avatar */}
              <div className="relative">
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="flex items-center space-x-2 p-1 sm:p-2 hover:bg-gray-100 rounded-md sm:rounded-lg transition-colors duration-200">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-gray-300 hover:border-blue-500 transition-colors duration-200">
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

                  <DialogContent className="w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 mt-2 absolute sm:right-0 right-2 z-50">
                    <div className="space-y-2">
                      <DialogTitle className="sr-only">User menu</DialogTitle>
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
                            <FaUserCircle className="w-4 h-4 text-blue-600" />
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
                          {darkMode ? (
                            <FaSun className="w-4 h-4 text-purple-600" />
                          ) : (
                            <FaMoon className="w-4 h-4 text-purple-600" />
                          )}
                        </div>
                        <span className="font-medium text-gray-700 dark:text-gray-200">
                          {darkMode ? "Light Mode" : "Dark Mode"}
                        </span>
                      </button>

                      <div className="border-t border-gray-200 pt-2">
                        <Button
                          variant="destructive"
                          className="w-full justify-start bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                          onClick={handleLogout}
                        >
                          <FaSignOutAlt className="w-4 h-4 mr-2" />
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
        {/* Mobile menu dropdown */}
        {mobileOpen && (
          <div className="md:hidden mt-2 bg-white border-t border-b border-gray-200 shadow-sm">
            <div className="px-4 py-3 space-y-3">
              <div className="flex items-center">
                <input
                  type="text"
                  placeholder={
                    isClient ? "Search workers..." : "Search jobs..."
                  }
                  className="w-full bg-gray-100 rounded-md px-3 py-2 outline-none placeholder-gray-500"
                />
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    handleDashboardClick();
                    setMobileOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  {isClient ? "Client Dashboard" : "Worker Dashboard"}
                </button>

                {isClient ? (
                  <>
                    <Link
                      to="/postjob"
                      onClick={() => setMobileOpen(false)}
                      className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Post Job
                    </Link>
                    <Link
                      to="/myjobs"
                      onClick={() => setMobileOpen(false)}
                      className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      My Jobs
                    </Link>
                    <Link
                      to="/findworkers"
                      onClick={() => setMobileOpen(false)}
                      className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Find Workers
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/home"
                      onClick={() => setMobileOpen(false)}
                      className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Find Work
                    </Link>
                    <Link
                      to="/myapplication"
                      onClick={() => setMobileOpen(false)}
                      className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      My Applications
                    </Link>
                  </>
                )}

                <Link
                  to="/message"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Messages
                </Link>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <Link
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Profile
                </Link>

                <button
                  onClick={() => {
                    toggleTheme();
                    setMobileOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {darkMode ? "Light Mode" : "Dark Mode"}
                </button>

                <button
                  onClick={() => {
                    handleLogout();
                    setMobileOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-md text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
