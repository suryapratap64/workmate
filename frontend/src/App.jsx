import React from "react";
import LandingPage from "./components/LandingPage";
import {
  WebScrapingLanding,
  WebScrapingHome,
  WebScrapingJobDetail,
} from "./components/webscraping";

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
import {
  ProtectedRoute,
  PublicRoute,
  ClientOnlyRoute,
  WorkerOnlyRoute,
} from "./components/ProtectedRoute";

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
        <PublicRoute>
          <WSignup />
        </PublicRoute>
      </Layout>
    ),
  },
  {
    path: "/csignup",
    element: (
      <Layout>
        <PublicRoute>
          <CSignup />
        </PublicRoute>
      </Layout>
    ),
  },
  {
    path: "/login",
    element: (
      <Layout>
        <PublicRoute>
          <Login />
        </PublicRoute>
      </Layout>
    ),
  },
  {
    path: "/verify-otp",
    element: (
      <Layout>
        <PublicRoute>
          <VerifyOtp />
        </PublicRoute>
      </Layout>
    ),
  },
  {
    path: "/home",
    element: (
      <Layout>
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      </Layout>
    ),
  },

  {
    path: "/client-dashboard",
    element: (
      <Layout>
        <ClientOnlyRoute>
          <ClientDashboard />
        </ClientOnlyRoute>
      </Layout>
    ),
  },

  {
    path: "/clientwallet",
    element: (
      <Layout>
        <ClientOnlyRoute>
          <ClientWallet />
        </ClientOnlyRoute>
      </Layout>
    ),
  },

  {
    path: "/workerwallet",
    element: (
      <Layout>
        <WorkerOnlyRoute>
          <WorkerWallet />
        </WorkerOnlyRoute>
      </Layout>
    ),
  },
  {
    path: "/findworkers",
    element: (
      <Layout>
        <ClientOnlyRoute>
          <FindWorkers />
        </ClientOnlyRoute>
      </Layout>
    ),
  },
  {
    path: "/worker-dashboard",
    element: (
      <Layout>
        <WorkerOnlyRoute>
          <WorkerDashboard />
        </WorkerOnlyRoute>
      </Layout>
    ),
  },
  {
    path: "/postjob",
    element: (
      <Layout>
        <ClientOnlyRoute>
          <Postjob />
        </ClientOnlyRoute>
      </Layout>
    ),
  },
  {
    path: "/message",
    element: (
      <Layout>
        <ProtectedRoute>
          <MessagePage />
        </ProtectedRoute>
      </Layout>
    ),
  },
  {
    path: "/profile",
    element: (
      <Layout>
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      </Layout>
    ),
  },
  {
    path: "/jobdetail/:id",
    element: (
      <Layout>
        <ProtectedRoute>
          <JobDetailPage />
        </ProtectedRoute>
      </Layout>
    ),
  },
  {
    path: "/mapview/:location",
    element: (
      <ProtectedRoute>
        <MapView />
      </ProtectedRoute>
    ),
  },
  {
    path: "/edit-profile",
    element: (
      <Layout>
        <ProtectedRoute>
          <EditProfile />
        </ProtectedRoute>
      </Layout>
    ),
  },
  {
    path: "/client-profile/:id",
    element: (
      <Layout>
        <ProtectedRoute>
          <ClientProfile />
        </ProtectedRoute>
      </Layout>
    ),
  },
  {
    path: "/user/:id",
    element: (
      <Layout>
        <ProtectedRoute>
          <PublicProfile />
        </ProtectedRoute>
      </Layout>
    ),
  },
  {
    path: "/myapplication",
    element: (
      <Layout>
        <WorkerOnlyRoute>
          <MyApplications />
        </WorkerOnlyRoute>
      </Layout>
    ),
  },
  {
    path: "/myjobs",
    element: (
      <Layout>
        <ClientOnlyRoute>
          <MyJobs />
        </ClientOnlyRoute>
      </Layout>
    ),
  },

  {
    path: "/start-conversation",
    element: (
      <Layout>
        <ProtectedRoute>
          <StartConversation />
        </ProtectedRoute>
      </Layout>
    ),
  },
  {
    path: "/webscraping",
    element: (
      <Layout>
        <WebScrapingLanding />
      </Layout>
    ),
  },
  {
    path: "/webscraping/home",
    element: (
      <Layout>
        <ProtectedRoute>
          <WebScrapingHome />
        </ProtectedRoute>
      </Layout>
    ),
  },
  {
    path: "/jobs/:jobId",
    element: (
      <Layout>
        <ProtectedRoute>
          <WebScrapingJobDetail />
        </ProtectedRoute>
      </Layout>
    ),
  },
  {
    path: "/video-chat/:conversationId/:callId?",
    element: (
      <SocketProvider>
        <ProtectedRoute>
          <VideoChat />
        </ProtectedRoute>
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
