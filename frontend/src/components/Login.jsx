import React, { useState } from "react";
import { Button } from "./ui/button";
import { Link, useNavigate } from "react-router-dom";
import { RiLockPasswordFill } from "react-icons/ri";
import { toast } from "react-toastify";
import axios from "axios";

const Login = () => {
  const [step, setStep] = useState(1);
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // Function to handle Mobile Number Submission
  const handleMobileSubmit = (e) => {
    e.preventDefault();
    if (mobileNumber.length !== 10) {
      alert("Enter a valid 10-digit mobile number.");
      return;
    }
    setStep(2); // Move to Password Step
  };

  
  // Function to handle Login Submission
  const handleLogin = async (e) => {
    e.preventDefault();
    const fullNumber = "+91" + mobileNumber;
    const payload = {
      mobileNumber: fullNumber.trim(),
      password: password.trim(),
    };
  
    console.log("Sending payload:", payload);
  
    try {
      const res = await axios.post(
        "http://localhost:8000/api/v1/user/login",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true, // If your backend requires cookies
        }
      );
  
      console.log("Response received:", res.data);
  
      if (res.data.success) {
        toast.success("Login Successful");
        navigate("/home");
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
     
      //  toast.error("Login Error:", error.res ? error.res.data : error);
       toast.error("wrong password. Please try again.");
    }
  };

  return (
    <>
      <div className="m-5 ml-8 text-2xl text-black p-1">
        <span className="bg-yellow-600 p-1 rounded-lg">WORKMATE</span>
      </div>

      <div className="flex flex-col items-center justify-center">
        <span className="text-3xl font-normal mt-15">Log in to Upwork</span>

        {step === 1 && (
          <div>
            <form onSubmit={handleMobileSubmit} className="mt-10">
              <span className="py-2 font-normal text-xl">Mobile Number</span>
              <input
                type="tel"
                name="mobileNumber"
                value={mobileNumber}
                placeholder="Enter your mobile number"
                onChange={(e) => setMobileNumber(e.target.value.trim())}
                pattern="[0-9]{10}"
                maxLength={10}
                required
                className="focus:outline-none h-10 w-100 text-xl border-gray-700 border-1 flex pl-2 rounded-sm text-black"
              />

              <Button
                type="submit"
                className="w-full justify-center text-xl h-12 bg-green-600 hover:bg-green-700 mt-8"
              >
                Continue
              </Button>
            </form>

            <div className="flex flex-row">
              <hr className="border-0.5 border-gray-700 mt-8 w-45" />
              <span className="text-gray-800 mt-5 font-light">or</span>
              <hr className="border-0.5 border-gray-700 mt-8 w-45" />
            </div>
            <Button className="min-w-full text-xl h-12 bg-blue-500 hover:bg-blue-700 mt-8">
              Continue with Google
            </Button>
            <div className="flex mt-3 flex-row">
              <span className="font-light justify-center">
                Don't have a Workmate account?{" "}
              </span>
              <Link className="text-blue-600 justify-center" to="/">
                Sign up
              </Link>
            </div>
          </div>
        )}

        {step === 2 && (
          <form
            onSubmit={handleLogin}
            className="flex flex-col items-center justify-center"
          >
            <h1 className="text-3xl font-semibold mt-8">Welcome</h1>
            <div>
              <span className="flex justify-center text-xl mt-3 font-normal">
                Mobile Number
              </span>
              <div className="flex border-2 mt-8 rounded-2xl border-gray-700 flex-row">
                <RiLockPasswordFill className="h-5 w-5 mt-2 ml-4" />

                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="focus:outline-none h-10 w-90 text-xl flex pl-5 text-black"
                />
              </div>
            </div>

            <div className="mt-4 gap-10 flex">
              <div className="gap-2 flex">
                <input
                  type="checkbox"
                  defaultChecked={false}
                  className="h-5 w-5 border-2 border-black hover:border-green-600 float-left"
                />
                <span className="flex float-left">Keep me logged in</span>
              </div>

              <span className="text-green-600">Forgot password?</span>
            </div>

            <Button
              type="submit"
              className="w-100 justify-center text-xl h-12 bg-green-600 hover:bg-green-700 mt-8 max-w-full"
            >
              Log in
            </Button>
            <span
              className="text-red-600 mt-6 cursor-pointer"
              onClick={() => setStep(1)}
            >
              Not you? Change number
            </span>
          </form>
        )}
      </div>
    </>
  );
};

export default Login;
