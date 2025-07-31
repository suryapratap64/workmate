import React, { useState } from "react";
import { Button } from "./ui/button";

import { Link } from "react-router-dom"; // ✅ CORRECT


import { IoBag } from "react-icons/io5";

import { GrUserWorker } from "react-icons/gr";

const LandingPage = () => {
//use state for manage the state of the radio button
const [role,setRole]=useState("Worker")

  return (
    <>
      <div className="relative m-5  ml-8 text-2xl text-black p-1 ">
        <span className="  bg-yellow-600 p-1 rounded-lg">WORKMATE</span>
      </div>
      <div className="flex flex-col items-center justify-center">
        <p className="text-4xl text-black font-semibold mt-8">
          Join as a Client or Worker
        </p>
        <div className="flex flex-row items center m-8 ">
          <div className={`p-2 text-2xl  font-medium w-55 h-45 border-2 rounded-lg m-4 ${role==="client" ? "border-green-600": "border-gray-600" }  `}   onClick={()=>setRole("client")}>
            <IoBag className="flex float-left" />
            <input className="h-5 w-5 flex float-right"  type="radio" name="role" checked={role==="client" }   onChange={()=>setRole("client")} />
          
            <br />
            <span className="flex mt-6">  I’m a client, hiring for a work</span>
          
          </div>
          <div
            className={`p-2 text-2xl  font-medium w-55 h-45 border-2 ${
              role === "worker" ? "border-green-600" : "border-gray-600"
            } rounded-lg m-4 cursor-pointer`}
            onClick={() => setRole("worker")}
          >
            <GrUserWorker className="flex float-left" />
            <input className="h-5 w-5 flex float-right" type="radio" name="worker" checked={role==="worker"} onChange={()=>setRole("worker")} />
            <br />
            <span className="flex mt-6">  I’m a worker, looking for work</span>
          
          </div>
        </div>


        
        <Link to={role === "client" ? "/csignup" : "/wsignup"}>
        <Button className="max-w-full text-xl bg-green-600 mt-5">
         {role=="client" ? "Apply as a Client" :"Apply as a Worker"}
        </Button></Link>

        <span className="flex flex-row m-4">
          Already have an account?{""}
          <Link className="text-green-600"  to="/login">Log in </Link>
        </span>
      </div>
    </>
  );
};
export default LandingPage;
