
import { createSlice } from '@reduxjs/toolkit';

const workerSlice=createSlice({
    name:"worker",
    initialState:{
        worker:null,
        workerProfile:null,
        selectedWorker:null,
    },
    reducers:{
        setWorker:(state,action)=>{
            state.worker=action.payload;
        }
    //     setWorkerProfile:(state,action)=>{
    //         state.workerProfile=action.payload;
    //         console.log("Updated Worker Profile:", state.workerProfile);
    //     },
    //     setSelectedWorker:(state,action)=>{
    //         state.selectedWorker=action.payload
    //     }
     }
})
export const {setWorker,setWorkerProfile,setSelectedWorker}=workerSlice.actions;
export default workerSlice.reducer

