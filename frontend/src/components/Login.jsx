import React, { useState } from "react";
import { Button } from "./ui/button";
import { Link, useNavigate } from "react-router-dom";
import { RiLockPasswordFill } from "react-icons/ri";
import { toast } from "react-toastify";
import axios from "axios";
import { API_URL } from "../config";
import { useDispatch } from "react-redux";
import { setUser, setToken } from "../redux/workerSlice";
import { User, Briefcase, Eye, EyeOff, ArrowRight } from "lucide-react";

const Login = () => {
  const [step, setStep] = useState(1);
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleMobileSubmit = (e) => {
    e.preventDefault();
    if (!userType) {
      toast.error("Please select your account type");
      return;
    }
    if (mobileNumber.length !== 10) {
      toast.error("Enter a valid 10-digit mobile number.");
      return;
    }
    setStep(2);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const fullNumber = mobileNumber;
    const payload = {
      mobileNumber: fullNumber.trim(),
      password: password.trim(),
      userType: userType,
    };

    try {
      const res = await axios.post(`${API_URL}/api/v1/user/login`, payload, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      if (res.data.success) {
        dispatch(setUser(res.data.user));
        dispatch(setToken(res.data.token));
        toast.success("Login Successful");

        if (userType === "client") {
          navigate("/home");
        } else {
          navigate("/home");
        }
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Login failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md sm:max-w-lg mx-auto px-2 sm:px-0">
        {/* Header */}
        <div className="text-center mb-8">
         
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Welcome back
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Sign in to your WorkMate account
          </p>
        </div>

        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 border ">
            <form onSubmit={handleMobileSubmit} className="space-y-6">
              {/* User Type Selection */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Account Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setUserType("client")}
                    className={`relative w-full p-5 sm:p-6 rounded-xl border-2 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-300 ${
                      userType === "client"
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-gray-200 hover:border-blue-300 hover:shadow-md"
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-3">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                          userType === "client"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600"
                        }`}
                      >
                        <User className="w-6 h-6" />
                      </div>
                      <div className="text-center">
                        <span
                          className={`font-semibold text-sm ${
                            userType === "client"
                              ? "text-blue-700"
                              : "text-gray-700"
                          }`}
                        >
                          Client
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          Hire Freelancer
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUserType("worker")}
                    className={`relative w-full p-5 sm:p-6 rounded-xl border-2 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-300 ${
                      userType === "worker"
                        ? "border-green-500 bg-green-50 shadow-md"
                        : "border-gray-200 hover:border-green-300 hover:shadow-md"
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-3">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                          userType === "worker"
                            ? "bg-green-100 text-green-600"
                            : "bg-gray-100 text-gray-600 group-hover:bg-green-100 group-hover:text-green-600"
                        }`}
                      >
                        <Briefcase className="w-6 h-6" />
                      </div>
                      <div className="text-center">
                        <span
                          className={`font-semibold text-sm ${
                            userType === "worker"
                              ? "text-green-700"
                              : "text-gray-700"
                          }`}
                        >
                          Freelancer
                        </span>
                        <p className="text-xs text-gray-500 mt-1">Find Jobs</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Mobile Number */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Mobile Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={mobileNumber}
                    placeholder="Enter your mobile number"
                    onChange={(e) =>
                      setMobileNumber(e.target.value.replace(/\s+/g, ""))
                    }
                    pattern="[0-9]{10}"
                    maxLength={10}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 text-sm sm:text-base"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-100 shadow-lg text-sm sm:text-base"
                aria-label="Continue"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>

              {/* <Button className="w-full mt-4 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 rounded-xl transition-all duration-200 text-sm sm:text-base">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button> */}
            </div>

            <div className="mt-6 text-center">
              <span className="text-gray-600">
                Don't have a WorkMate account?{" "}
              </span>
              <Link
                className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                to="/"
              >
                Sign up
              </Link>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 border border-gray-100">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="text-center mb-6">
                {/* <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Welcome back
                </h2> */}
                <p className="text-gray-600">
                  Logging in as{" "}
                  <span
                    className={`font-semibold ${
                      userType === "client" ? "text-blue-600" : "text-green-600"
                    }`}
                  >
                    {userType === "client" ? "Client" : "Freelancer"}
                  </span>
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 text-sm sm:text-base"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    Keep me logged in
                  </span>
                </label>
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Forgot password?
                </button>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  "Sign in"
                )}
              </Button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-center text-gray-500 hover:text-gray-700 transition-colors text-sm"
              >
                ← Back to account type
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
