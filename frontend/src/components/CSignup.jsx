import React, { useState } from "react";
import { Button } from "./ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import {
  Loader2,
  User,
  Building2,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import { auth } from "../lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { API_URL } from "../config";

const CSignup = () => {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignup = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Extract user details from Google profile
      const userDetails = {
        firstName: user.displayName?.split(" ")[0] || "",
        lastName: user.displayName?.split(" ").slice(1).join(" ") || "",
        email: user.email,
        mobileNumber: user.phoneNumber || "",
        password: "", // Password not needed for Google auth
        profilePicture: user.photoURL,
        emailVerified: user.emailVerified,
        country: "India",
        userType: "client",
      };

      const idToken = await user.getIdToken();

      // Send to backend with complete user details
      const res = await axios.post(
        `${API_URL}/api/v1/user/google-register`,
        {
          idToken,
          ...userDetails,
        },
        { withCredentials: true }
      );

      if (res.data.success) {
        // Store user data in localStorage or Redux
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        toast.success("Welcome! Successfully signed in with Google 🎉");
        navigate("/client/dashboard");
      } else {
        toast.error(res.data.message || "Signup failed");
      }
    } catch (err) {
      console.error("Google signup failed:", err);
      toast.error(err.message || "Google signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const navigate = useNavigate();
  const { worker } = useSelector((store) => store.worker);

  const [input, setInput] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobileNumber: "",
    password: "",
    country: "India",
    state: "",
    localAddress: "",
    countryCode: "+91",
  });

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const [emailVerified, setEmailVerified] = useState(false);

  const verifyEmailWithGoogle = async () => {
    if (!auth || !auth.app) {
      toast.error(
        "Firebase Auth not initialized. Check your VITE_FIREBASE_* env vars and restart the dev server."
      );
      return;
    }
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      if (user?.email) {
        setInput((s) => ({ ...s, email: user.email }));
        setEmailVerified(true);
      }
    } catch (err) {
      console.error("Google sign-in failed", err);
      toast.error("Google verification failed");
    }
  };

  const SignupHandler = async (e) => {
    e.preventDefault();
    try {
      if (!input.email) {
        toast.error("Please enter your email before proceeding");
        return;
      }
      if (!emailVerified) {
        toast.error("Please verify your email using Google before proceeding");
        return;
      }
      setLoading(true);

      // Try to include Firebase idToken if available so backend can verify email
      let idToken;
      try {
        if (auth && auth.currentUser) {
          idToken = await auth.currentUser.getIdToken();
        }
      } catch (err) {
        console.warn(
          "Could not obtain idToken from Firebase:",
          err?.message || err
        );
      }

      const payload = {
        ...input,
        userType: "client",
        ...(idToken ? { idToken } : {}),
      };

      const registerRes = await axios.post(
        `${API_URL}/api/v1/user/register`,
        payload,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (registerRes.data.success) {
        toast.success("Account created successfully!");
        navigate("/login");
      } else {
        toast.error(registerRes.data.message || "Registration failed");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong!";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Using email-based registration — no separate OTP verification step in UI

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Join as a Client
          </h1>
          <p className="text-gray-600">
            Hire talented professionals and get your projects done
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={SignupHandler} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={input.firstName}
                  onChange={changeEventHandler}
                  placeholder="Surya"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={input.lastName}
                  onChange={changeEventHandler}
                  placeholder="Pratap"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                />
              </div>
            </div>
            {/* Email and OAuth verify */}
            <div className="space-y-3 mt-3">
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={input.email}
                onChange={changeEventHandler}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900"
              />
              <button
                type="button"
                onClick={verifyEmailWithGoogle}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-gray-700 font-medium"
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google"
                  className="w-5 h-5"
                />
                Verify with Google
              </button>
              {emailVerified && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  Email verified via Google
                </div>
              )}
            </div>

            {/* Mobile Number */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Mobile Number
              </label>
              <div className="flex gap-2">
                <select
                  name="countryCode"
                  value={input.countryCode}
                  onChange={changeEventHandler}
                  className="w-24 px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900"
                  required
                >
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                </select>
                <input
                  type="tel"
                  name="mobileNumber"
                  value={input.mobileNumber}
                  onChange={changeEventHandler}
                  placeholder="Mobile Number"
                  pattern="[0-9]{10}"
                  maxLength="10"
                  required
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 min-w-0 text-gray-900 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={input.password}
                onChange={changeEventHandler}
                placeholder="Create a strong password"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
              />
            </div>

            {/* Location Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Country
                </label>
                <select
                  name="country"
                  value={input.country}
                  onChange={changeEventHandler}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900"
                  required
                >
                  <option value="India">India</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  State
                </label>
                <select
                  name="state"
                  value={input.state}
                  onChange={changeEventHandler}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900"
                  required
                >
                  <option value="">Select State</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="West Bengal">West Bengal</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Kerala">Kerala</option>
                </select>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Local Address
              </label>
              <textarea
                name="localAddress"
                value={input.localAddress}
                onChange={changeEventHandler}
                placeholder="Enter your full address"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 resize-none"
              />
            </div>

            {/* Terms */}
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                required
                className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-sm text-gray-600">
                I agree to the{" "}
                <a
                  href="#"
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  Privacy Policy
                </a>
              </span>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="animate-spin w-5 h-5 mr-2" />
                  Creating account...
                </div>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-500">
                  or continue with
                </span>
              </div>
            </div>

            {/* Google Sign-in Button */}
            <Button
              type="button"
              onClick={handleGoogleSignup}
              disabled={loading}
              className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 border border-gray-300 rounded-xl transition-all duration-200 flex items-center justify-center gap-3"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="w-5 h-5"
              />
              Continue with Google
            </Button>

            <div className="text-center mt-6">
              <span className="text-gray-600">Already have an account? </span>
              <Link
                className="text-purple-600 font-semibold hover:text-purple-700 transition-colors"
                to="/login"
              >
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
      {/* No recaptcha/OTP UI in email-based flow */}
    </div>
  );
};

export default CSignup;
