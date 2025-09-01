import React from "react";
import { useLocation } from "react-router-dom";
import MessageNotification from "./MessageNotification";
import CallNotification from "./CallNotification";
import NavBar from "./NavBar";
import { useAuth } from "../hooks/useAuth";

const Layout = ({ children }) => {
  // Use the auth hook to fetch user profile
  useAuth();

  let location;

  try {
    location = useLocation();
  } catch (error) {
    // If useLocation fails, default to showing navbar
    console.warn("useLocation not available, defaulting to show navbar");
    return (
      <>
        <NavBar />
        {children}
        <MessageNotification />
      </>
    );
  }

  // Routes where navbar should be shown
  const showNavbarRoutes = [
    "/home",
    "/clienthome",
    "/client-dashboard",
    "/worker-dashboard",
    "/postjob",
    "/message",
    "/profile",
    "/edit-profile",
    "/client-profile",
  ];

  // Check if current route should show navbar
  const shouldShowNavbar =
    showNavbarRoutes.some((route) => location.pathname.startsWith(route)) ||
    location.pathname.startsWith("/mapview");

  return (
    <>
      {shouldShowNavbar && <NavBar />}
      {children}
      <MessageNotification />
      <CallNotification />
    </>
  );
};

export default Layout;
