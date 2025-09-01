import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Chat from "../components/Chat/Chat";
import VideoCallPage from "../pages/VideoCallPage";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/chat/:conversationId?" element={<Chat />} />
        <Route path="/call/:conversationId" element={<VideoCallPage />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
