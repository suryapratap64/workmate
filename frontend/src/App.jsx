import React from "react";
import LandingPage from "./components/LandingPage";
import {
  BrowserRouter,
  createBrowserRouter,
  Route,
  RouterProvider,
  Routes,
} from "react-router-dom";
import { SocketProvider } from "./context/SocketContext";
import VideoChat from "./components/Chat/VideoChat";
import WSignup from "./components/WSignup";
import CSignup from "./components/CSignup";
import Login from "./components/Login";
import OtpPage from "./components/Password";
import Password from "./components/Password";
import VerifyOtp from "./components/VerifyOtp";
import Home from "./components/Home";
import ClientHome from "./components/ClientHome";
import Postjob from "./components/Postjob";
import MessagePage from "./components/MessagePage";
import Profile from "./components/Profile";
import { ThemeProvider } from "./context/ThemeContext";
import Layout from "./components/Layout";
import ClientDashboard from "./components/ClientDashboard";
import WorkerDashboard from "./components/WorkerDashboard";
import ClientWallet from "./components/ClientWallet";
import WorkerWallet from "./components/WorkerWallet";
import { useSelector } from "react-redux";
import FindWorkers from "./components/FindWorkers";
import MapView from "./components/MapView";
import EditProfile from "./components/EditProfile";
import JobDetailPage from "./components/JobDetailPage";
import ClientProfile from "./components/ClientProfile";
import PublicProfile from "./components/PublicProfile";
import MyApplications from "./components/MyApplications";
import MyJobs from "./components/MyJobs";
import StartConversation from "./components/StartConversation";
import ErrorBoundary from "./components/ErrorBoundary";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const browserRouter = createBrowserRouter([
  {
    path: "/",
    element: (
      <Layout>
        <LandingPage />
      </Layout>
    ),
  },
  {
    path: "/wsignup",
    element: (
      <Layout>
        <WSignup />
      </Layout>
    ),
  },
  {
    path: "/csignup",
    element: (
      <Layout>
        <CSignup />
      </Layout>
    ),
  },
  {
    path: "/login",
    element: (
      <Layout>
        <Login />
      </Layout>
    ),
  },
  {
    path: "/verify-otp",
    element: (
      <Layout>
        <VerifyOtp />
      </Layout>
    ),
  },
  {
    path: "/home",
    element: (
      <Layout>
        <Home />
      </Layout>
    ),
  },
  {
    path: "/clienthome",
    element: (
      <Layout>
        <ClientHome />
      </Layout>
    ),
  },

  {
    path: "/client-dashboard",
    element: (
      <Layout>
        <ClientDashboard />
      </Layout>
    ),
  },

  {
    path: "/clientwallet",
    element: (
      <Layout>
        <ClientWallet />
      </Layout>
    ),
  },

  {
    path: "/workerwallet",
    element: (
      <Layout>
        <WorkerWallet />
      </Layout>
    ),
  },
  {
    path: "/findworkers",
    element: (
      <Layout>
        <FindWorkers />
      </Layout>
    ),
  },
  {
    path: "/worker-dashboard",
    element: (
      <Layout>
        <WorkerDashboard />
      </Layout>
    ),
  },
  {
    path: "/postjob",
    element: (
      <Layout>
        <Postjob />
      </Layout>
    ),
  },
  {
    path: "/message",
    element: (
      <Layout>
        <MessagePage />
      </Layout>
    ),
  },
  {
    path: "/profile",
    element: (
      <Layout>
        <Profile />
      </Layout>
    ),
  },
  {
    path: "/jobdetail/:id",
    element: (
      <Layout>
        <JobDetailPage />
      </Layout>
    ),
  },
  {
    path: "/mapview/:location",
    element: <MapView />,
  },
  {
    path: "/edit-profile",
    element: (
      <Layout>
        <EditProfile />
      </Layout>
    ),
  },
  {
    path: "/client-profile/:id",
    element: (
      <Layout>
        <ClientProfile />
      </Layout>
    ),
  },
  {
    path: "/user/:id",
    element: (
      <Layout>
        <PublicProfile />
      </Layout>
    ),
  },
  {
    path: "/myapplication",
    element: (
      <Layout>
        <MyApplications />
      </Layout>
    ),
  },
  {
    path: "/myjobs",
    element: (
      <Layout>
        <MyJobs />
      </Layout>
    ),
  },

  {
    path: "/start-conversation",
    element: (
      <Layout>
        <StartConversation />
      </Layout>
    ),
  },
  {
    // Support optional callId in URL so /video-chat/:conversationId/:callId works
    path: "/video-chat/:conversationId/:callId?",
    element: (
      <SocketProvider>
        <VideoChat />
      </SocketProvider>
    ),
  },
]);

const App = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <SocketProvider>
          <RouterProvider router={browserRouter} />
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </SocketProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
