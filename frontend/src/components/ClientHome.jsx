import React from "react";
import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";
import JobList from "./JobFeed";
import RightBar from "./RightBar";
import Clientnavbar from "./Clientnavbar";
import ClientnavBar from "./Clientnavbar";

const clientHome = () => {
  return (
    <div className="flex flex-col bg-amber-200 h-screen w-full">
      <ClientnavBar />

      {/* Main content area */}
      <div className="flex flex-1  overflow-y-auto">
        {/* Center Content */}

        <Outlet />

        {/* Right Sidebar */}
      </div>
    </div>
  );
};

export default clientHome;
