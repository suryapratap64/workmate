import React, { useState } from "react";
import { Button } from "./ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import {
  Loader2,
  User,
  Briefcase,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { auth } from "../lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { toast } from "react-toastify";
import { API_URL, WS_URL } from "../config";
const WSignup = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [userInput, setUserInput] = useState(null);
  // inside the signup component or a small hook
  // your axios wrapper

  // switched to email-based registration flow; phone/recaptcha removed to avoid
  // appVerificationDisabledForTesting errors when Firebase auth isn't initialized

  // const verifyOtpAndRegister = async (otp, signupPayload) => {
  //   try {
  //     const result = await window.confirmationResult.confirm(otp);
  //     const user = result.user;
  //     const idToken = await user.getIdToken();

  //     // Send idToken + signup data to your backend registration endpoint
  //     const response = await axios.post("/api/auth/firebase-register", {
  //       idToken,
  //       ...signupPayload, // firstName, lastName, email, password (if you also collect), etc.
  //     });

  //     return response.data; // should contain your app JWT + user
  //   } catch (err) {
  //     console.error("OTP verification failed", err);
  //     throw err;
  //   }
  // };

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

  const fullNumber = input.countryCode + input.mobileNumber;

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

      // If the user verified email with Google, try to get the Firebase idToken
      // so backend can verify the email server-side and save it.
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
        userType: "worker",
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

  // No OTP verification step — using email (and optional Google verification)

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Join as a Freelancer
          </h1>
          <p className="text-gray-600">
            Find amazing opportunities and showcase your skills
          </p>
        </div>

        {step === 1 && (
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
                    placeholder="John"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
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
                    placeholder="Doe"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900"
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
                    className="w-24 px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900"
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
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 min-w-0 text-gray-900 placeholder-gray-400"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 resize-none"
                />
              </div>

              {/* Terms */}
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  required
                  className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm text-gray-600">
                  I agree to the{" "}
                  <a
                    href="#"
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    Privacy Policy
                  </a>
                </span>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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

              <div className="text-center">
                <span className="text-gray-600">Already have an account? </span>
                <Link
                  className="text-green-600 font-semibold hover:text-green-700 transition-colors"
                  to="/login"
                >
                  Sign in
                </Link>
              </div>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <form onSubmit={verifyOtpHandler} className="space-y-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Verify Your Mobile Number
                </h2>
                <p className="text-gray-600">
                  We've sent a 6-digit code to{" "}
                  <span className="font-semibold text-gray-900">
                    {userInput?.mobileNumber}
                  </span>
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Enter OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  pattern="[0-9]{6}"
                  required
                  className="w-full px-4 py-3 text-center text-2xl font-mono border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 tracking-widest"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="animate-spin w-5 h-5 mr-2" />
                    Verifying...
                  </div>
                ) : (
                  "Verify & Create Account"
                )}
              </Button>

              <div className="text-center">
                <span className="text-sm text-gray-500">
                  Didn't receive the code?{" "}
                </span>
                <button
                  type="button"
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  Resend in 60s
                </button>
              </div>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-center text-gray-500 hover:text-gray-700 transition-colors text-sm"
              >
                ← Back to registration
              </button>
            </form>
          </div>
        )}
      </div>
      {/* No recaptcha/OTP UI in email-based flow */}
    </div>
  );
};

export default WSignup;
