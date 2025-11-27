import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RefreshCw } from "lucide-react";
import {
  setJobs,
  setFilterOptions,
  setLoading,
  setError,
  setAppliedFilters,
  setCurrentPage,
  setPagination,
} from "../../redux/webscrapingSlice";
import {
  fetchScrapedJobs,
  fetchFilterOptions,
} from "../../services/webscraping.service";
import FilterSidebar from "./FilterSidebar";
import JobCard from "./JobCard";

const WebScrapingHome = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.worker);

  // Redux selectors
  const { jobs, appliedFilters, filterOptions, pagination, loading } =
    useSelector((state) => state.webscraping);

  // Local state for caching and refresh
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cacheTimestamp, setCacheTimestamp] = useState(null);
  const [showRefreshIndicator, setShowRefreshIndicator] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Fetch filter options on mount
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const data = await fetchFilterOptions();
        dispatch(setFilterOptions(data.filterOptions));
      } catch (error) {
        console.error("Error loading filter options:", error);
      }
    };
    loadFilterOptions();
  }, [dispatch]);

  // Smart cache strategy: Show cached data on load, then refresh in background
  const loadJobsWithCache = async (isManualRefresh = false) => {
    try {
      // Show cached data if available and not a manual refresh
      if (jobs.length > 0 && !isManualRefresh && !isRefreshing) {
        dispatch(setLoading(false));
        // Trigger background refresh
        triggerBackgroundRefresh();
        return;
      }

      dispatch(setLoading(true));

      const filters = {
        page: pagination.currentPage,
        limit: pagination.pageSize,
        location: appliedFilters.location,
        platform: appliedFilters.platforms,
        jobType: appliedFilters.jobTypes,
        experience: appliedFilters.experienceLevels,
        minSalary: appliedFilters.salaryRange.min,
        maxSalary: appliedFilters.salaryRange.max,
        search: appliedFilters.search,
      };

      const data = await fetchScrapedJobs(filters);

      if (data.jobs && data.jobs.length > 0) {
        console.log("✅ Jobs fetched from backend:", {
          count: data.jobs.length,
          first: data.jobs[0].title,
          platform: data.jobs[0].platform,
        });
      }

      dispatch(
        setJobs({
          jobs: data.jobs,
          totalJobs: data.totalJobs,
        })
      );
      dispatch(
        setPagination({
          totalPages: data.totalPages || 1,
        })
      );

      setCacheTimestamp(new Date());
      setShowRefreshIndicator(false);
    } catch (error) {
      console.error("Error loading jobs:", error);
      dispatch(setError("Failed to load jobs"));
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Background refresh strategy: Update data without blocking UI
  const triggerBackgroundRefresh = async () => {
    try {
      setIsRefreshing(true);
      setShowRefreshIndicator(true);

      console.log("🔄 Triggering background refresh without blocking UI...");

      const filters = {
        page: pagination.currentPage,
        limit: pagination.pageSize,
        location: appliedFilters.location,
        platform: appliedFilters.platforms,
        jobType: appliedFilters.jobTypes,
        experience: appliedFilters.experienceLevels,
        minSalary: appliedFilters.salaryRange.min,
        maxSalary: appliedFilters.salaryRange.max,
        search: appliedFilters.search,
        triggerRefresh: "true", // Signal backend to refresh in background
      };

      const data = await fetchScrapedJobs(filters);

      // Silently update cache - user won't see loading spinner
      dispatch(
        setJobs({
          jobs: data.jobs,
          totalJobs: data.totalJobs,
        })
      );

      setCacheTimestamp(new Date());
      console.log("✅ Background refresh complete - Cache updated");
    } catch (error) {
      console.error("Background refresh error:", error);
      // Don't show error for background refresh - just log it
    } finally {
      setIsRefreshing(false);
      setTimeout(() => setShowRefreshIndicator(false), 1000);
    }
  };

  // Manual refresh: User clicks button for instant fresh data
  const handleManualRefresh = async () => {
    try {
      setIsRefreshing(true);
      console.log("🚀 Manual refresh triggered by user");

      const filters = {
        page: 1,
        limit: pagination.pageSize,
        location: appliedFilters.location,
        platform: appliedFilters.platforms,
        jobType: appliedFilters.jobTypes,
        experience: appliedFilters.experienceLevels,
        minSalary: appliedFilters.salaryRange.min,
        maxSalary: appliedFilters.salaryRange.max,
        search: appliedFilters.search,
      };

      const data = await fetchScrapedJobs(filters);

      dispatch(
        setJobs({
          jobs: data.jobs,
          totalJobs: data.totalJobs,
        })
      );
      dispatch(
        setPagination({
          totalPages: data.totalPages || 1,
        })
      );

      setCacheTimestamp(new Date());
      console.log("✅ Manual refresh complete");
    } catch (error) {
      console.error("Manual refresh error:", error);
      dispatch(setError("Failed to refresh jobs"));
    } finally {
      setIsRefreshing(false);
    }
  };

  // Fetch jobs whenever filters or pagination changes
  useEffect(() => {
    loadJobsWithCache(false);
  }, [appliedFilters, pagination.currentPage, dispatch]);

  // Format cache timestamp
  const formatCacheTime = (timestamp) => {
    if (!timestamp) return "Never";
    const diff = Math.floor((new Date() - new Date(timestamp)) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  // Filter handlers
  const handleLocationChange = (location) => {
    dispatch(
      setAppliedFilters({
        ...appliedFilters,
        location: appliedFilters.location.includes(location)
          ? appliedFilters.location.filter((l) => l !== location)
          : [...appliedFilters.location, location],
      })
    );
    dispatch(setCurrentPage(1));
  };

  const handlePlatformChange = (platform) => {
    dispatch(
      setAppliedFilters({
        ...appliedFilters,
        platforms: appliedFilters.platforms.includes(platform)
          ? appliedFilters.platforms.filter((p) => p !== platform)
          : [...appliedFilters.platforms, platform],
      })
    );
    dispatch(setCurrentPage(1));
  };

  const handleJobTypeChange = (jobType) => {
    dispatch(
      setAppliedFilters({
        ...appliedFilters,
        jobTypes: appliedFilters.jobTypes.includes(jobType)
          ? appliedFilters.jobTypes.filter((t) => t !== jobType)
          : [...appliedFilters.jobTypes, jobType],
      })
    );
    dispatch(setCurrentPage(1));
  };

  const handleExperienceChange = (experience) => {
    dispatch(
      setAppliedFilters({
        ...appliedFilters,
        experienceLevels: appliedFilters.experienceLevels.includes(experience)
          ? appliedFilters.experienceLevels.filter((e) => e !== experience)
          : [...appliedFilters.experienceLevels, experience],
      })
    );
    dispatch(setCurrentPage(1));
  };

  const handleSalaryRangeChange = (min, max) => {
    dispatch(
      setAppliedFilters({
        ...appliedFilters,
        salaryRange: {
          min: parseInt(min) || 0,
          max: parseInt(max) || 1000000,
        },
      })
    );
    dispatch(setCurrentPage(1));
  };

  const handleSearchChange = (query) => {
    dispatch(
      setAppliedFilters({
        ...appliedFilters,
        search: query,
      })
    );
    dispatch(setCurrentPage(1));
  };

  const handleResetFilters = () => {
    dispatch(
      setAppliedFilters({
        location: [],
        platforms: [],
        jobTypes: [],
        experienceLevels: [],
        salaryRange: {
          min: 0,
          max: 1000000,
        },
        search: "",
      })
    );
    dispatch(setCurrentPage(1));
  };

  const handleJobSelect = (job) => {
    navigate(`/jobs/${job._id}`, { state: { job } });
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      dispatch(setCurrentPage(newPage));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-0 md:p-0">
      <div className="max-w-full mx-auto">
        {/* Header with Refresh Button */}
        <div className="mb-4 p-4 md:p-6 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                Job Opportunities
              </h1>
              <p className="text-gray-600 text-sm">
                Find and apply to job listings from top companies
              </p>
            </div>

            {/* Refresh Section */}
            <div className="flex flex-col items-end gap-2">
              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                  isRefreshing
                    ? "bg-gray-200 text-gray-600 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
                }`}
              >
                <RefreshCw
                  size={16}
                  className={isRefreshing ? "animate-spin" : ""}
                />
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </button>
              <div className="text-xs text-gray-500">
                {showRefreshIndicator && (
                  <span className="inline-block px-2 py-1 bg-amber-100 text-amber-800 rounded">
                    Updating in background...
                  </span>
                )}
                {!showRefreshIndicator && cacheTimestamp && (
                  <span>Updated {formatCacheTime(cacheTimestamp)}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid Layout: Filters Left + Job List Middle */}
        <div className="grid grid-cols-1 md:grid-cols-8 gap-0">
          {/* Left Sidebar - Filters (Hidden on Mobile) */}
          <div className="hidden md:block md:col-span-2 bg-white border-r border-gray-200">
            <FilterSidebar
              filterOptions={filterOptions}
              appliedFilters={appliedFilters}
              onLocationChange={handleLocationChange}
              onPlatformChange={handlePlatformChange}
              onJobTypeChange={handleJobTypeChange}
              onExperienceChange={handleExperienceChange}
              onSalaryRangeChange={handleSalaryRangeChange}
              onResetFilters={handleResetFilters}
            />
          </div>

          {/* Middle - Job List */}
          <div className="col-span-1 md:col-span-6 bg-white p-4 md:p-6">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={appliedFilters.search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex justify-center items-center h-96">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading jobs...</p>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!loading && jobs.length === 0 && (
                <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                  <p className="text-gray-600 mb-2">No jobs found</p>
                  <p className="text-sm text-gray-500">
                    Try adjusting your filters or search terms
                  </p>
                </div>
              )}

              {/* Job Cards */}
              {!loading && jobs.length > 0 && (
                <>
                  <div className="space-y-4">
                    {jobs.map((job) => (
                      <JobCard
                        key={job._id}
                        job={job}
                        onSelect={() => handleJobSelect(job)}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-6 p-4 bg-white rounded-lg">
                      <button
                        onClick={() =>
                          handlePageChange(pagination.currentPage - 1)
                        }
                        disabled={pagination.currentPage === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: pagination.totalPages }).map(
                          (_, i) => (
                            <button
                              key={i + 1}
                              onClick={() => handlePageChange(i + 1)}
                              className={`px-3 py-2 rounded-lg text-sm font-medium ${
                                pagination.currentPage === i + 1
                                  ? "bg-blue-500 text-white"
                                  : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              {i + 1}
                            </button>
                          )
                        )}
                      </div>

                      <button
                        onClick={() =>
                          handlePageChange(pagination.currentPage + 1)
                        }
                        disabled={
                          pagination.currentPage === pagination.totalPages
                        }
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebScrapingHome;
