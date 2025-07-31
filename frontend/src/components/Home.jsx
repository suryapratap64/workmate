import React from "react";
import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";
import JobList from "./JobFeed";
import RightBar from "./RightBar";

const Home = () => {
  return (
    <div className="flex flex-col h-screen">
      <NavBar />

      {/* Main content area */}
      <div className="flex flex-1  overflow-y-auto">
        {/* Left Sidebar */}
        <aside className="w-full flex flex-grow  ">
          <JobList />
        </aside>

        {/* Center Content */}

        <Outlet />

        {/* Right Sidebar */}
        <div className="w-100  rounded-lg p-4 ">
          <RightBar />
        </div>
      </div>
    </div>
  );
};

export default Home;
