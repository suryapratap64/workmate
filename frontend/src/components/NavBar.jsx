import React, { useState, useEffect, useRef } from "react";
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
import {
  FaUserCircle,
  FaMoon,
  FaSun,
  FaSignOutAlt,
  FaSearch,
} from "react-icons/fa";

const NavBar = () => {
  const { darkMode, toggleTheme, setLightMode } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.worker);

  // Reset search query when changing pages
  useEffect(() => {
    if (!location.search) {
      setSearchQuery("");
      setIsSearching(false);
    }
  }, [location.pathname]);

  // Handle click outside search results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim()) {
      setIsSearching(true);
      try {
        const response = await axios.get(
          `${API_URL}/api/v1/job/search?query=${encodeURIComponent(query)}`,
          {
            withCredentials: true,
          }
        );
        if (response.data.success) {
          setSearchResults(response.data.jobs);
          setShowResults(true);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const handleJobSelect = (jobId) => {
    setSearchQuery("");
    setShowResults(false);
    navigate(`/jobdetail/${jobId}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowResults(false);
      if (isClient) {
        navigate(`/findworkers?search=${encodeURIComponent(searchQuery)}`);
      } else {
        navigate(`/home?search=${encodeURIComponent(searchQuery)}`);
      }
    }
  };

  // Determine user type
  const isClient = user?.userType === "client";
  const isWorker = user?.userType === "worker";
  const isActivePath = (path) => {
    return location.pathname === path;
  };
  const handleLogout = async () => {
    try {
      // First, reset theme to light mode
      setLightMode();

      // Then proceed with logout
      try {
        await axios.post(
          `${API_URL}/api/v1/user/logout`,
          {},
          {
            withCredentials: true,
          }
        );
      } catch (error) {
        console.error("Logout API error:", error);
        // Continue with local logout even if API call fails
      }

      // Clear local state
      dispatch(logout());

      // Save theme preference as light
      localStorage.setItem("theme", "light");

      // Show success message
      toast.success("Logged out successfully");

      // Navigate to landing page
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      // Ensure we still clear everything even if something fails
      dispatch(logout());
      localStorage.setItem("theme", "light");
      document.documentElement.classList.remove("dark");
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
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50 w-full">
      <div className="w-full max-w-[2000px] mx-auto px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2">
        <div className="flex items-center justify-between">
          {/* Logo and Navigation */}
          <div className="flex items-center gap-6 sm:gap-8">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen((s) => !s)}
              className="md:hidden inline-flex items-center justify-center p-1.5 rounded text-gray-600 hover:text-blue-600 hover:bg-blue-50"
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
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
                  className="h-5 w-5"
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
            <Link to="/home" className="flex-shrink-0">
              <Logo />
            </Link>

            {/* Navigation Links - Desktop */}
            <div className="hidden md:flex items-center gap-5 lg:gap-7">
              <button
                onClick={handleDashboardClick}
                className={`text-xs lg:text-sm font-medium  transition-colors duration-200 cursor-pointer pb-0.5 border-b-2 ${
                  isActivePath("/client-dashboard") ||
                  isActivePath("/worker-dashboard")
                    ? "text-blue-600 border-blue-600"
                    : "text-blue-500  border-transparent hover:text-blue-600"
                }`}
              >
                {isClient ? "Dashboard" : "Dashboard"}
              </button>

              {isClient ? (
                <>
                  <Link
                    to="/postjob"
                    className={`text-xs lg:text-sm font-medium transition-colors duration-200 pb-0.5 border-b-2 ${
                      isActivePath("/postjob")
                        ? "text-blue-600 border-blue-600"
                        : "text-gray-700 border-transparent hover:text-blue-600"
                    }`}
                  >
                    Post Job
                  </Link>
                  <Link
                    to="/myjobs"
                    className={`text-xs lg:text-sm font-medium transition-colors duration-200 pb-0.5 border-b-2 ${
                      isActivePath("/myjobs")
                        ? "text-blue-600 border-blue-600"
                        : "text-gray-700 border-transparent hover:text-blue-600"
                    }`}
                  >
                    My Jobs
                  </Link>
                  <Link
                    to="/findworkers"
                    className={`text-xs lg:text-sm font-medium transition-colors duration-200 pb-0.5 border-b-2 ${
                      isActivePath("/findworkers")
                        ? "text-blue-600 border-blue-600"
                        : "text-gray-700 border-transparent hover:text-blue-600"
                    }`}
                  >
                    Find Workers
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/home"
                    className={`text-xs lg:text-sm font-medium transition-colors duration-200 pb-0.5 border-b-2 ${
                      isActivePath("/home")
                        ? "text-blue-600 border-blue-600"
                        : "text-gray-700 border-transparent hover:text-blue-600"
                    }`}
                  >
                    Find Work
                  </Link>
                  <Link
                    to="/myapplication"
                    className={`text-xs lg:text-sm font-medium transition-colors duration-200 pb-0.5 border-b-2 ${
                      isActivePath("/myapplication")
                        ? "text-blue-600 border-blue-600"
                        : "text-gray-700 border-transparent hover:text-blue-600"
                    }`}
                  >
                    Applications
                  </Link>
                </>
              )}

              <Link
                to="/message"
                className={`text-xs lg:text-sm font-medium transition-colors duration-200 pb-0.5 border-b-2 ${
                  isActivePath("/message")
                    ? "text-blue-600 border-blue-600"
                    : "text-gray-700 border-transparent hover:text-blue-600"
                }`}
              >
                Messages
              </Link>

              <Link
                to="/webscraping/home"
                className={`text-xs lg:text-sm font-medium transition-colors duration-200 pb-0.5 border-b-2 ${
                  isActivePath("/webscraping/home")
                    ? "text-blue-600 border-blue-600"
                    : "text-gray-700 border-transparent hover:text-blue-600"
                }`}
              >
                Premium Jobs
              </Link>
            </div>
          </div>

          {/* Search and Actions */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
            {/* Search Box */}
            <div ref={searchRef} className="relative hidden sm:block">
              <form
                onSubmit={handleSearchSubmit}
                className="flex items-center bg-gray-50 rounded-full px-2.5 py-1 "
              >
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearch}
                  placeholder={
                    isClient ? "Search workers..." : "Search jobs..."
                  }
                  className="bg-transparent outline-none text-gray-900 placeholder-gray-400 w-32 sm:w-40 lg:w-48 text-xs lg:text-sm"
                />
              </form>

              {/* Search Results Dropdown */}
              {showResults && searchResults.length > 0 && (
                <div className="absolute mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-auto z-50">
                  {searchResults.map((job) => (
                    <button
                      key={job._id}
                      onClick={() => handleJobSelect(job._id)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors duration-150 text-xs"
                    >
                      <div className="text-gray-900 font-medium truncate">
                        {job.title}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Loading State */}
              {isSearching && (
                <div className="absolute mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-2 text-center">
                  <div className="text-xs text-gray-500">Searching...</div>
                </div>
              )}
            </div>

            {/* User Avatar & Menu */}
            <div className="relative">
              <Dialog>
                <DialogTrigger asChild>
                  <button className="flex items-center p-0.5 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full overflow-hidden border border-gray-300 hover:border-blue-500 transition-colors duration-200">
                      {user?.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-xs">
                            {user?.firstName?.charAt(0) ||
                              user?.name?.charAt(0) ||
                              "U"}
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                </DialogTrigger>

                <DialogContent className="w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 absolute top-full right-0 sm:right-2 z-50 mt-1">
                  <div className="space-y-0.5">
                    <DialogTitle className="sr-only">User menu</DialogTitle>

                    {/* User Info */}
                    <div className="pb-1.5 border-b border-gray-200">
                      <div className="flex items-center gap-1.5">
                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                          {user?.profilePicture ? (
                            <img
                              src={user.profilePicture}
                              alt="Avatar"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 font-semibold text-xs">
                                {user?.firstName?.charAt(0) ||
                                  user?.name?.charAt(0) ||
                                  "U"}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-900 truncate">
                            {user?.firstName && user?.lastName
                              ? `${user.firstName} ${user.lastName}`
                              : user?.name || "User"}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">
                            {user?.userType || "User"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Link to={`/profile`} onClick={() => setMobileOpen(false)}>
                      <div className="flex items-center gap-2 px-1.5 py-1 hover:bg-gray-50 rounded transition-colors duration-200 text-xs">
                        <FaUserCircle className="w-3 h-3 text-blue-600 flex-shrink-0" />
                        <span className="text-gray-700">Profile</span>
                      </div>
                    </Link>

                    <button
                      onClick={toggleTheme}
                      className="flex items-center gap-2 px-1.5 py-1 hover:bg-gray-50 rounded transition-colors duration-200 w-full text-left text-xs"
                    >
                      {darkMode ? (
                        <>
                          <FaSun className="w-3 h-3 flex-shrink-0" />
                          <span className="text-gray-700">Light Mode</span>
                        </>
                      ) : (
                        <>
                          <FaMoon className="w-3 h-3 flex-shrink-0" />
                          <span className="text-gray-700">Dark Mode</span>
                        </>
                      )}
                    </button>

                    <div className="border-t border-gray-200 pt-0.5 mt-0.5">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-1.5 py-1 hover:bg-red-50 rounded transition-colors duration-200 text-xs"
                      >
                        <FaSignOutAlt className="w-3 h-3 text-red-600 flex-shrink-0" />
                        <span className="text-red-600">Logout</span>
                      </button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden mt-1.5 pt-1.5 border-t border-gray-200 space-y-0.5">
            <div ref={searchRef} className="relative mb-3">
              <form onSubmit={handleSearchSubmit} className="flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearch}
                  placeholder={
                    isClient ? "Search workers..." : "Search jobs..."
                  }
                  className="w-full bg-gray-100 rounded-l px-3 py-1.5 outline-none placeholder-gray-500 text-xs"
                />
                <button
                  type="submit"
                  className="bg-gray-100 text-gray-500 hover:text-blue-600 px-3 py-1.5 rounded-r transition-colors duration-200"
                >
                  <FaSearch className="h-3.5 w-3.5" />
                </button>
              </form>

              {/* Mobile Search Results */}
              {showResults && searchResults.length > 0 && (
                <div className="absolute mt-1 w-full bg-white border border-gray-200 rounded shadow-lg max-h-48 overflow-auto z-50">
                  {searchResults.map((job) => (
                    <button
                      key={job._id}
                      onClick={() => {
                        handleJobSelect(job._id);
                        setMobileOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 text-xs"
                    >
                      <div className="text-gray-900 font-medium truncate">
                        {job.title}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {isSearching && (
                <div className="absolute mt-1 w-full bg-white border border-gray-200 rounded shadow-lg p-2 text-center">
                  <div className="text-xs text-gray-500">Searching...</div>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                handleDashboardClick();
                setMobileOpen(false);
              }}
              className="w-full text-left px-2 py-1 rounded text-gray-700 hover:bg-gray-50 text-xs font-medium"
            >
              Dashboard
            </button>

            {isClient ? (
              <>
                <Link
                  to="/postjob"
                  onClick={() => setMobileOpen(false)}
                  className="block px-2 py-1 rounded text-gray-700 hover:bg-gray-50 text-xs font-medium"
                >
                  Post Job
                </Link>
                <Link
                  to="/myjobs"
                  onClick={() => setMobileOpen(false)}
                  className="block px-2 py-1 rounded text-gray-700 hover:bg-gray-50 text-xs font-medium"
                >
                  My Jobs
                </Link>
                <Link
                  to="/findworkers"
                  onClick={() => setMobileOpen(false)}
                  className="block px-2 py-1 rounded text-gray-700 hover:bg-gray-50 text-xs font-medium"
                >
                  Find Workers
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/home"
                  onClick={() => setMobileOpen(false)}
                  className="block px-2 py-1 rounded text-gray-700 hover:bg-gray-50 text-xs font-medium"
                >
                  Find Work
                </Link>
                <Link
                  to="/myapplication"
                  onClick={() => setMobileOpen(false)}
                  className="block px-2 py-1 rounded text-gray-700 hover:bg-gray-50 text-xs font-medium"
                >
                  Applications
                </Link>
              </>
            )}

            <Link
              to="/message"
              onClick={() => setMobileOpen(false)}
              className="block px-2 py-1 rounded text-gray-700 hover:bg-gray-50 text-xs font-medium"
            >
              Messages
            </Link>

            <Link
              to="/webscraping/home"
              onClick={() => setMobileOpen(false)}
              className="block px-2 py-1 rounded text-purple-600 hover:bg-purple-50 text-xs font-medium"
            >
            Premium Jobs
            </Link>

            <div className="pt-0.5 border-t border-gray-200 space-y-0.5">
              <Link
                to="/profile"
                onClick={() => setMobileOpen(false)}
                className="block px-2 py-1 rounded text-gray-700 hover:bg-gray-50 text-xs font-medium"
              >
                Profile
              </Link>

              <button
                onClick={() => {
                  toggleTheme();
                  setMobileOpen(false);
                }}
                className="w-full text-left px-2 py-1 rounded text-gray-700 hover:bg-gray-50 text-xs font-medium"
              >
                {darkMode ? "Light Mode" : "Dark Mode"}
              </button>

              <button
                onClick={() => {
                  handleLogout();
                  setMobileOpen(false);
                }}
                className="w-full text-left px-2 py-1 rounded text-red-600 hover:bg-red-50 text-xs font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
