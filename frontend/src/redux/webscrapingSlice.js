import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // Jobs
  jobs: [],
  selectedJob: null,
  totalJobs: 0,

  // Filters
  appliedFilters: {
    location: [],
    platforms: [],
    jobTypes: [],
    experienceLevels: [],
    salaryRange: {
      min: 0,
      max: 1000000,
    },
    search: "",
  },

  // Filter options (from backend)
  filterOptions: {
    locations: [],
    platforms: [],
    jobTypes: [],
    experiences: [],
    salaryRange: {
      minSalary: 0,
      maxSalary: 500000,
    },
  },

  // Pagination
  pagination: {
    currentPage: 1,
    totalPages: 1,
    pageSize: 20,
  },

  // User filters (saved)
  userFilters: [],

  // Loading states
  loading: false,
  filterLoading: false,
  error: null,
};

const webscrapingSlice = createSlice({
  name: "webscraping",
  initialState,
  reducers: {
    // Jobs actions
    setJobs: (state, action) => {
      state.jobs = action.payload.jobs;
      state.totalJobs = action.payload.totalJobs;
    },

    setSelectedJob: (state, action) => {
      state.selectedJob = action.payload;
    },

    // Filter actions
    setAppliedFilters: (state, action) => {
      state.appliedFilters = { ...state.appliedFilters, ...action.payload };
      state.pagination.currentPage = 1; // Reset to first page on filter change
    },

    updateFilterOption: (state, action) => {
      const { filterType, value } = action.payload;
      if (state.appliedFilters[filterType]) {
        if (Array.isArray(state.appliedFilters[filterType])) {
          if (state.appliedFilters[filterType].includes(value)) {
            state.appliedFilters[filterType] = state.appliedFilters[
              filterType
            ].filter((item) => item !== value);
          } else {
            state.appliedFilters[filterType].push(value);
          }
        } else {
          state.appliedFilters[filterType] = value;
        }
        state.pagination.currentPage = 1;
      }
    },

    setSalaryRange: (state, action) => {
      state.appliedFilters.salaryRange = action.payload;
      state.pagination.currentPage = 1;
    },

    setSearchQuery: (state, action) => {
      state.appliedFilters.search = action.payload;
      state.pagination.currentPage = 1;
    },

    resetFilters: (state) => {
      state.appliedFilters = {
        location: [],
        platforms: [],
        jobTypes: [],
        experienceLevels: [],
        salaryRange: {
          min: 0,
          max: 1000000,
        },
        search: "",
      };
      state.pagination.currentPage = 1;
    },

    setFilterOptions: (state, action) => {
      state.filterOptions = action.payload;
    },

    // Pagination actions
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },

    setCurrentPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },

    // User filters actions
    setUserFilters: (state, action) => {
      state.userFilters = action.payload;
    },

    // Loading states
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setFilterLoading: (state, action) => {
      state.filterLoading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setJobs,
  setSelectedJob,
  setAppliedFilters,
  updateFilterOption,
  setSalaryRange,
  setSearchQuery,
  resetFilters,
  setFilterOptions,
  setPagination,
  setCurrentPage,
  setUserFilters,
  setLoading,
  setFilterLoading,
  setError,
  clearError,
} = webscrapingSlice.actions;

export default webscrapingSlice.reducer;
