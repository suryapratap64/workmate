import { createSlice } from "@reduxjs/toolkit";

const workerSlice = createSlice({
  name: "worker",
  initialState: {
    user: null,
    token: null,
    worker: null,
    workerProfile: null,
    selectedWorker: null,
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
    setToken: (state, action) => {
      state.token = action.payload;
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
  setToken,
  setSelectedWorker,
  logout,
} = workerSlice.actions;
export default workerSlice.reducer;
