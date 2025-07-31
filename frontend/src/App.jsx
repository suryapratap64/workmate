import React from "react";
import LandingPage from "./components/LandingPage";
import {
  BrowserRouter,
  createBrowserRouter,
  Route,
  RouterProvider,
  Routes,
} from "react-router-dom";
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
import ThemeProvider from "./components/ThemeProvider"; 

const browserRouter = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/wsignup",
    element: <WSignup />,
  },
  {
    path: "/csignup",
    element: <CSignup />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/verify-otp",
    element: <VerifyOtp />,
  },
  {
    path: "/home",
    element: <Home />,
  },
  {
    path: "/clienthome",
    element: <ClientHome />,
  },
  {
    path: "/postjob",
    element: <Postjob />,
  },
  {
    path: "/message",
    element: <MessagePage />,
  },
  {
    path: "/profile",
    element: <Profile />,
  },
]);

const App = () => {
  return (
    <>
    

      <ThemeProvider>
        <RouterProvider router={browserRouter} />
      </ThemeProvider>
    </>
  );
};

export default App;
