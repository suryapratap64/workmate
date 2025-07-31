import { Worker } from "../models/worker.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Otp } from "../models/otp.model.js";
import otpGenerator from 'otp-generator';
import axios from "axios";
import twilio from "twilio";



export const registerWorker=async(req ,res)=>{
    const {firstName,lastName,mobileNumber,password,country,state,localAddress}=req.body;
    try {
        if(!firstName || !lastName || !mobileNumber || !password || !country || !state){
            return res.status(400).json({
                message:"All fields are required",
                success:false
            })
        }
        const user=await Worker.findOne({mobileNumber});
        if(user){
            return res.status(400).json({
                message:"User is already registered",
                success:false
            })
        }
        const hashedPassword=await bcrypt.hash(password,10);
        await Worker.create({
            firstName,
            lastName,
            mobileNumber,
            password:hashedPassword,
            country,
            state,
            localAddress
        })
        return res.status(201).json({
            message:"User registered successfully",
            success:true
        })
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Internal Server Error",
            success:false
        })
        
    }
}

export const loginWorker=async(req ,res)=>{
    const{mobileNumber,password}=req.body;
    try {
        if(!mobileNumber || !password){
            return res.status(400).json({
                message:"All fields are required",
                success:false
            })
        }
        let worker=await Worker.findOne({mobileNumber});
        if(!worker){
            return res.status(400).json({
                message:"Worker not found",
                success:false
            })

        }
        const isPasswordMatch =await bcrypt.compare(password,worker.password);
        if(!isPasswordMatch){
            return res.status(400).json({
                message:"Invalid mobilenumber or password",
                success:false
            })
        }
        const token =jwt.sign({userId:worker._id},process.env.SECRET_KEY,{expiresIn:'1d'});
        return res.cookie('token',token,{
            httpOnly:true,
            expires:new Date(Date.now() + 1*24*60*60*1000),
            sameSite:'none',
            secure:true
        }).json({
            message:"Login successfully",
            success:true,
            token,
            worker:{
                _id:worker._id,
                firstName:worker.firstName,
                lastName:worker.lastName,
                mobileNumber:worker.mobileNumber,
                country:worker.country,
                state:worker.state,
                localAddress:worker.localAddress
            }

        })










    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Internal server error",
            success:false
        })
        
    }
}
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = twilio(accountSid, authToken);
export const otpGenerate = async (req, res) => {
    const { mobileNumber } = req.body;
  
    try {
      if (!mobileNumber) {
        return res.status(400).json({
          message: "Mobile number is required",
          success: false,
        });
      }
  console.log(mobileNumber);
      // 1. Generate OTP
      const otpCode = otpGenerator.generate(6, {
        digits: true,
        alphabets: false,
        upperCase: false,
        specialChars: false,
      });
  
      // 2. Send OTP via Twilio
      await twilioClient.messages.create({
        body: `Thanks for signing up on WorkMate!
Your OTP is: ${otpCode}

Valid for 5 minutes. Please do not share this with anyone.

— Team WorkMate `,
        to: mobileNumber, // e.g. +919999999999
        from: process.env.TWILIO_PHONE_NUMBER,
      });

     
  
       // Ensure international format
       let formattedNumber = mobileNumber;
       if (!formattedNumber.startsWith("+")) {
         formattedNumber = `+91${formattedNumber}`;
       }

       await Otp.create({
         mobileNumber: formattedNumber,
         otp: otpCode,
        upsert: true, new: true, setDefaultsOnInsert: true,
    });
      // 3. Remove old OTPs
    //   await Otp.deleteMany({ mobileNumber });
  
    //   // 4. Save new OTP (MongoDB TTL will auto-expire it in 5 mins)
    //   await Otp.create({ mobileNumber, otp: otpCode });
  
      return res.status(200).json({
        success: true,
        message: "OTP sent successfully",
      });
  
    } catch (error) {
      console.error('OTP Generation Error:', error);
      return res.status(500).json({
        message: "Internal server error",
        success: false,
      });
    }
  };
// export  const sendOtp = async (mobileNumber, otpCode) => {
//     try {

//       const res = await axios.get("https://www.fast2sms.com/dev/bulkV2", {
//         params: {
//           authorization: process.env.FAST2SMS_API_KEY, // Store your API key securely
//           variables_values: otpCode,
//           route: "otp",
//           numbers: mobileNumber,
//         },
//       });
  
//       console.log("SMS Sent:", res.data);
//       return res.data;
//     } catch (err) {
//       console.error("SMS Error:", err.response?.data || err.message);
//       throw err;
//     }
//   };

export const verifyOtp=async(req,res)=>{

    const { mobileNumber, otp } = req.body;

  try {
    // Validate input
    if (!mobileNumber || !otp) {
      return res.status(400).json({ success: false, message: "Mobile number and OTP are required" });
    }

    // Clean up inputs
    const cleanNumber = mobileNumber.trim();
    const cleanOtp = otp.toString().trim();

    // Search for valid OTP in DB
    const validOtp = await Otp.findOne({
      mobileNumber: cleanNumber,
      otp: cleanOtp,
    });
        
          await Otp.deleteMany({ mobileNumber }); // remove OTP after use
        
         
        
          res.status(200).json({ success: true, message: "Registration successful" });
    
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Internal server error",
            success:false
        })
        
        
    }
}