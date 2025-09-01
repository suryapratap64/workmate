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
    setUser: (state, action) => {
      state.user = action.payload;
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

export const { setWorker, setUser, setToken, logout } = workerSlice.actions;
export default workerSlice.reducer;
