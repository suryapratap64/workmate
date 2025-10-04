import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";

const VerifyOtp = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Get userInput from localStorage
  const userInput = JSON.parse(localStorage.getItem("userInput"));

  useEffect(() => {
    if (!userInput?.mobileNumber) {
      toast.error("Missing mobile number. Please sign up again.");
      navigate("/signup");
    }
  }, [userInput, navigate]);

  const verifyOtpHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Confirm OTP with Firebase confirmation result stored earlier
      if (!window.confirmationResult) {
        toast.error("No confirmation result found. Please request OTP again.");
        return;
      }

      const confirmationResult = window.confirmationResult;
      const result = await confirmationResult.confirm(otp.toString());
      const firebaseUser = result.user;
      const idToken = await firebaseUser.getIdToken();

      // Send idToken + signup data to backend register endpoint
      const registerRes = await axios.post(
        `${API_URL}/api/v1/user/register`,
        { ...userInput, idToken },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (registerRes.data.success) {
        toast.success("Account created successfully!");
        localStorage.removeItem("userInput");
        navigate("/login");
      } else {
        toast.error(registerRes.data.message || "Registration failed");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-black">
      <form
        onSubmit={verifyOtpHandler}
        className="flex flex-col gap-5 border p-8 rounded-lg shadow-md min-w-[300px]"
      >
        <h2 className="text-2xl text-center">Verify Your Mobile Number</h2>
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          maxLength={6}
          pattern="[0-9]{6}"
          required
          className="focus:outline-none h-10 border border-gray-500 p-2 rounded text-xl"
        />

        {loading ? (
          <Button className="bg-green-600" disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verifying...
          </Button>
        ) : (
          <Button type="submit" className="bg-green-600">
            Verify OTP & Register
          </Button>
        )}

        <span className="text-center text-sm text-gray-600">
          Didn't get OTP? <b>Try again after 1 minute</b>
        </span>
      </form>
    </div>
  );
};

export default VerifyOtp;
