import axios from "axios";
import { API_URL } from "../config";

const apiClient = axios.create({
  baseURL: `${API_URL}/api/v1/webscraping`,
  withCredentials: true,
});

// Get all scraped jobs with filters
export const fetchScrapedJobs = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    if (filters.page) params.append("page", filters.page);
    if (filters.limit) params.append("limit", filters.limit);
    if (filters.location && filters.location.length > 0) {
      filters.location.forEach((loc) => params.append("location", loc));
    }
    if (filters.platform && filters.platform.length > 0) {
      filters.platform.forEach((plat) => params.append("platform", plat));
    }
    if (filters.jobType && filters.jobType.length > 0) {
      filters.jobType.forEach((type) => params.append("jobType", type));
    }
    if (filters.experience && filters.experience.length > 0) {
      filters.experience.forEach((exp) => params.append("experience", exp));
    }
    if (filters.minSalary) params.append("minSalary", filters.minSalary);
    if (filters.maxSalary) params.append("maxSalary", filters.maxSalary);
    if (filters.search) params.append("search", filters.search);

    const response = await apiClient.get(`/jobs?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching jobs:", error);
    throw error;
  }
};

// Get single job by ID
export const fetchScrapedJobById = async (jobId) => {
  try {
    const response = await apiClient.get(`/jobs/${jobId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching job:", error);
    throw error;
  }
};

// Search jobs
export const searchJobs = async (query, page = 1, limit = 20) => {
  try {
    const response = await apiClient.get(
      `/search?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
    );
    return response.data;
  } catch (error) {
    console.error("Error searching jobs:", error);
    throw error;
  }
};

// Get filter options
export const fetchFilterOptions = async () => {
  try {
    const response = await apiClient.get("/filter-options");
    return response.data;
  } catch (error) {
    console.error("Error fetching filter options:", error);
    throw error;
  }
};

// Get job statistics
export const fetchJobStats = async () => {
  try {
    const response = await apiClient.get("/stats");
    return response.data;
  } catch (error) {
    console.error("Error fetching stats:", error);
    throw error;
  }
};

// Save user filter (protected)
export const saveUserFilter = async (filterData) => {
  try {
    const response = await apiClient.post("/filters/save", filterData);
    return response.data;
  } catch (error) {
    console.error("Error saving filter:", error);
    throw error;
  }
};

// Get user filters (protected)
export const fetchUserFilters = async () => {
  try {
    const response = await apiClient.get("/filters");
    return response.data;
  } catch (error) {
    console.error("Error fetching user filters:", error);
    throw error;
  }
};

// Apply to job (protected)
export const applyToScrapedJob = async (jobId) => {
  try {
    const response = await apiClient.post(`/jobs/${jobId}/apply`);
    return response.data;
  } catch (error) {
    console.error("Error applying to job:", error);
    throw error;
  }
};

export default apiClient;
