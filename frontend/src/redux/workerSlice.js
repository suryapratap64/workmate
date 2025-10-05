import { createSlice } from "@reduxjs/toolkit";

const workerSlice = createSlice({
  name: "worker",
  initialState: {
    user: null,
    token: null,
    worker: null,
    workerProfile: null,
    selectedWorker: null,
    applications: [],
    myJobs: [],
    wallet: null,
    transactions: [],
  },
  reducers: {
    setWorker: (state, action) => {
      state.worker = action.payload;
    },
    setWorkers: (state, action) => {
      state.workers = action.payload;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setSelectedWorker: (state, action) => {
      state.selectedWorker = action.payload;
    },
    setApplications: (state, action) => {
      state.applications = action.payload;
    },
    setMyJobs: (state, action) => {
      state.myJobs = action.payload;
    },
    updateJobInList: (state, action) => {
      const updated = action.payload;
      state.myJobs = (state.myJobs || []).map((j) =>
        String(j._id) === String(updated._id) ? updated : j
      );
    },
    updateApplicantInJob: (state, action) => {
      const { jobId, applicantId, applicant } = action.payload;
      state.myJobs = (state.myJobs || []).map((j) => {
        if (String(j._id) !== String(jobId)) return j;
        return {
          ...j,
          applicants: (j.applicants || []).map((a) =>
            String(a._id || a._id) === String(applicantId)
              ? { ...a, ...applicant }
              : a
          ),
        };
      });
    },
    // Update the global applications list (for workers) when a client accepts/rejects
    updateApplicationStatusGlobally: (state, action) => {
      const { jobId, workerId, status } = action.payload;
      state.applications = (state.applications || []).map((job) => {
        if (String(job._id) !== String(jobId)) return job;
        if (
          job.myApplication &&
          String(job.myApplication.worker) === String(workerId)
        ) {
          return { ...job, myApplication: { ...job.myApplication, status } };
        }
        return job;
      });
    },
    addApplication: (state, action) => {
      // prepend new application job
      state.applications = [action.payload, ...(state.applications || [])];
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
    setWallet: (state, action) => {
      state.wallet = action.payload;
    },
    setTransactions: (state, action) => {
      state.transactions = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.worker = null;
      state.workerProfile = null;
      state.selectedWorker = null;
    },
  },
});

export const {
  setWorker,
  setWorkers,
  setUser,
  setApplications,
  addApplication,
  setMyJobs,
  updateJobInList,
  updateApplicantInJob,
  updateApplicationStatusGlobally,
  setToken,
  setSelectedWorker,
  logout,
  setWallet,
  setTransactions,
} = workerSlice.actions;
export default workerSlice.reducer;
