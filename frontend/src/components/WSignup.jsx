// import React, { useState } from "react";
// import { Button } from "./ui/button";
// import { Link, useNavigate } from "react-router-dom";
// import { useSelector } from "react-redux";
//  // Ensure this import is correct
// import axios from "axios"; 
// import "react-toastify/dist/ReactToastify.css";
// import { Loader2 } from "lucide-react";
// import { toast } from "react-toastify";
// const WSignup = () => {

//   const [step, setStep] = useState(1);
//   const [input, setInput] = useState({
//     firstName: "",
//     lastName: "",
//     mobileNumber: "",
//     password: "",
//     country: "India",
//     state: "",
//     localAddress: "",
//      countryCode: "+91"
//   });
//   const changeEventHandler = (e) => {
//     setInput({ ...input, [e.target.name]: e.target.value });
//   };
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();
//   const {worker} = useSelector((Store) => Store.worker);
//   const showToast = () => {
//     toast.success("This is a success message!", {
//       position: "bottom-right",
//       autoClose: 3000, // Toast disappears after 3 seconds
//       hideProgressBar: false,
//       closeOnClick: true,
//       pauseOnHover: true,
//       draggable: true,
//       progress: undefined,
//       theme: "colored", // light, dark, colored
//     });
//   };
//   // const SignupHandler = async (e) => {
//   //   e.preventDefault();

//   //   try {
//   //     setLoading(true);
//   //     const res = await axios.post(
//   //       "http://localhost:8000/api/v1/user/register",
//   //       input,
//   //       {
//   //         headers: {
//   //           "Content-Type": "application/json",
//   //         },
//   //         withCredentials: true,
//   //       }
//   //     );
//   //     const res = await axios.post("http://localhost:8000/api/v1/user/send-otp", {
//   //       mobileNumber: input.mobileNumber,
//   //     });
  
//   //     if (res.data.success) {
//   //       localStorage.setItem("userInput", JSON.stringify(input));
//   //       navigate("/verify-otp"); // navigate to OTP page
//   //     }











//   //     if (res.data.success) {
//   //       navigate("/login");
//   //       toast.success(res.data.message);
//   //       setInput({
//   //         firstName: "",
//   //         lastName: "",
//   //         mobileNumber: "",
//   //         password: "",
//   //         country: "India",
//   //         state: "",
//   //         localAddress: "",
//   //       });
//   //     }
//   //   } catch (error) {
//   //     console.log(error);
//   //     const errorMessage = error.response?.data?.message || "An error occurred";
//   //     toast.error(errorMessage);
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };

//   const SignupHandler = async (e) => {
//     e.preventDefault();
//     const fullNumber = input.countryCode + input.mobileNumber;
    
//     try {
//       setLoading(true);

//       // 1. Send OTP only (not register yet)
//       const otpRes = await axios.post(
//         "http://localhost:8000/api/v1/user/send-otp",
//         { mobileNumber:fullNumber },

//         {
//           headers: { "Content-Type": "application/json" },
//           withCredentials: true,
//         }
//       );

//       if (otpRes.data.success) {
//         // 2. Save user input temporarily
//         localStorage.setItem("userInput", JSON.stringify(input));

//         // 3. Navigate to OTP verification page
//         toast.success("OTP sent successfully!");
//         setStep(2);
//       } else {
//         toast.error("Failed to send OTP");
//       }
//     } catch (error) {
//       const errorMessage = error.response?.data?.message || "Something went wrong!";
//       toast.error(errorMessage);
//     } finally {
//       setLoading(false);
//     }



//   }
//   const [otp, setOtp] = useState("");
 
 

//   // Get userInput from localStorage
//   const userInput = JSON.parse(localStorage.getItem("userInput"));

//   useEffect(() => {
//     if (!userInput?.mobileNumber) {
//       toast.error("Missing mobile number. Please sign up again.");
//       navigate("/signup");
//     }
//   }, [userInput, navigate]);

//   const verifyOtpHandler = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       // 1. Verify OTP
//       const otpRes = await axios.post(
//         "http://localhost:8000/api/v1/user/verify-otp",
//         {
//           ...userInput, // includes name, email, password, mobileNumber
//           otp: otp.toString(),
//         },
//         {
//           headers: { "Content-Type": "application/json" },
//           withCredentials: true,
//         }
//       );

//       if (!otpRes.data.success) {
//         toast.error("Invalid OTP");
//         return;
//       }

//       // 2. OTP verified → Now Register
//       const registerRes = await axios.post(
//         "http://localhost:8000/api/v1/user/register",
//         userInput,
//         {
//           headers: { "Content-Type": "application/json" },
//           withCredentials: true,
//         }
//       );

//       if (registerRes.data.success) {
//         toast.success("Account created successfully!");
//         localStorage.removeItem("userInput");
//         navigate("/login");
//       } else {
//         toast.error(registerRes.data.message || "Registration failed");
//       }
//     } catch (err) {
//       const msg = err.response?.data?.message || "Something went wrong";
//       toast.error(msg);
//     } finally {
//       setLoading(false);
//     }
//   };
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";

const WSignup = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [userInput, setUserInput] = useState(null);

  const navigate = useNavigate();
  const { worker } = useSelector((store) => store.worker);

  const [input, setInput] = useState({
    firstName: "",
    lastName: "",
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
  const fullNumber = input.countryCode + input.mobileNumber;
  const SignupHandler = async (e) => {
    e.preventDefault();
    

    try {
      setLoading(true);
      const otpRes = await axios.post(
        "http://localhost:8000/api/v1/user/send-otp",
        { mobileNumber: fullNumber },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (otpRes.data.success) {
        localStorage.setItem("userInput", JSON.stringify({ ...input, mobileNumber: fullNumber }));
        toast.success("OTP sent successfully!");
        setStep(2);
      } else {
        toast.error("Failed to send OTP");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Something went wrong!";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  const showToast = () => {
        toast.success("This is a success message!", {
          position: "bottom-right",
          autoClose: 3000, // Toast disappears after 3 seconds
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored", // light, dark, colored
        });
      };


  useEffect(() => {
    if (step === 2) {
      const stored = JSON.parse(localStorage.getItem("userInput"));
      if (!stored?.mobileNumber) {
        toast.error("Missing mobile number. Please sign up again.");
        navigate("/signup");
      } else {
        setUserInput(stored);
      }
    }
  }, [step, navigate]);

  const verifyOtpHandler = async (e) => {
    e.preventDefault();
    if (!userInput) return;

    try {
      setLoading(true);

 

      const otpRes = await axios.post(
        "http://localhost:8000/api/v1/user/verify-otp",
        {
          mobileNumber:fullNumber,
          otp: otp.toString(),
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (!otpRes.data.success) {
        toast.error("Invalid OTP");
        return;
      }

      const registerRes = await axios.post(
        "http://localhost:8000/api/v1/user/register",
        userInput,
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

    <>

      <div className=" absolute m-5  ml-8 text-2xl text-black p-1 ">
        <span className="  bg-yellow-600 p-1 rounded-lg">WORKMATE</span>
      </div>

      {step==1 &&(
        <div className="flex flex-col items-center justify-center w-screen h-screen">
        <form
          onSubmit={SignupHandler}
          className=" rounded-sm text-black flex flex-col gap-5 p-8  "
        >
          <div>
            <h1 className="text-center mb-5 mt-60 text-3xl  ">
              Sign up to find work you love
            </h1>
          </div>
          <div className="gap-3 flex flex-row">
            <div>
              <span className="py-2 font-normal text-black ">First Name</span>
              <input
                type="text"
                name="firstName"
                placeholder=""
                onChange={changeEventHandler}
                className="focus:outline-none h-8 min-w-full  border-gray-700 border-1 text-xl flex p-2  rounded-sm    text-black"
              />
            </div>
            <div>
              <span className=" font-normal">Last Name</span>
              <input
                type="text"
                name="lastName"
                placeholder=""
                onChange={changeEventHandler}
                className="focus:outline-none h-8 min-w-full text-xl  border-gray-700 border-1 flex pl-2 rounded-sm hover:border-2  text-black"
              />
            </div>
          </div>
          <div className="flex gap-2">
  <select
    name="countryCode"
    onChange={changeEventHandler}
    className="w-24 text-black border-gray-700 border-1 rounded-sm"
    required
  >
    <option value="+91">🇮🇳 +91</option>
    <option value="+1">🇺🇸 +1</option>
    <option value="+44">🇬🇧 +44</option>
    {/* Add more country codes as needed */}
  </select>

  <input
    type="tel"
    name="mobileNumber"
    onChange={changeEventHandler}
    placeholder="Mobile Number"
    className="flex-grow h-8 text-xl border-gray-700 border-1 pl-2 rounded-sm text-black"
    pattern="[0-9]{10}"
    maxLength="10"
    required
  />
</div>

          <div>
            <span className="py-2 font-normal">Password</span>
            <input
              type="text"
              name="password"
              placeholder=""
                onChange={changeEventHandler}
              className="focus:outline-none h-8 min-w-full text-xl  border-gray-700 border-1 flex pl-2 rounded-sm  text-black"
            />
          </div>
          <div>
            <span className="py-2 font-normal">Country</span>
            <select
              type="text"
              name="country"
              placeholder=""
                onChange={changeEventHandler}
              className="focus:outline-none h-8 min-w-full text-xl  border-gray-700 border-1 flex pl-2 rounded-sm  text-black"
            >
              <option value="India">India</option>
            </select>
          </div>
          <div>
            <span className="py-2 font-normal">State</span>
            <select
              type="text"
              name="state"
              placeholder=""
                onChange={changeEventHandler}
              className="focus:outline-none h-8 min-w-full text-xl  border-gray-700 border-1 flex pl-2 rounded-sm  text-black"
            >
              <option value="">Select State</option>
              <option value="Andhra Pradesh">Andhra Pradesh</option>
              <option value="Arunachal Pradesh">Arunachal Pradesh</option>
              <option value="Assam">Assam</option>
              <option value="Bihar">Bihar</option>
              <option value="Chhattisgarh">Chhattisgarh</option>
              <option value="Goa">Goa</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Haryana">Haryana</option>
              <option value="Himachal Pradesh">Himachal Pradesh</option>
              <option value="Jharkhand">Jharkhand</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Kerala">Kerala</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Manipur">Manipur</option>
              <option value="Meghalaya">Meghalaya</option>
              <option value="Mizoram">Mizoram</option>
              <option value="Nagaland">Nagaland</option>
              <option value="Odisha">Odisha</option>
              <option value="Punjab">Punjab</option>
              <option value="Rajasthan">Rajasthan</option>
              <option value="Sikkim">Sikkim</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Telangana">Telangana</option>
              <option value="Tripura">Tripura</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Uttarakhand">Uttarakhand</option>
              <option value="West Bengal">West Bengal</option>
            </select>
          </div>
          <div>
            <span className="py-2 font-normal">Local Address</span>
            <input
              type="text"
              name="localAddress"
              placeholder=""
                onChange={changeEventHandler}
              className="focus:outline-none h-8 min-w-full text-xl  border-gray-700 border-1 flex pl-2 rounded-sm  text-black"
            />
          </div>


          <div className="gap-1 mt-4 flex ">
            <input
              type="checkbox"
              className="h-5 w-5 border-2 font-normal text-red-400 border-black hover:border-green-600 float-left"
            />
            <span>
              Send me OTP for register in workmate plateform for finding jobs.
            </span>
          </div>

          {loading?(
            <Button onClick={showToast} className="bg-green-600 max-w-full mt-8">
              <Loader2  className="mr-2 h-4 w-2 animate-spin" />
              Please wait..
            </Button>

          ) : (
            <Button type="submit"  className="bg-green-600 max-w-full mt-8">
              Create my Account
            </Button>
    
)}
          {/* <Button type="submit" className="bg-green-600 max-w-full mt-8">
            Create my Account
          </Button> */}

          <span className="text-center mt-3">
            Already have an account?{" "}
            <Link className="text-green-800 hover:text-green-400 " to="/login">
              Log in
            </Link>
          </span>
        </form>
      </div>
      )}
      {step==2 && (
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
      )}
      
    </>
  );
};

export default WSignup;
