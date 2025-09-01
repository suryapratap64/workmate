import { Worker } from "../models/worker.model.js";
import { Client } from "../models/client.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Otp } from "../models/otp.model.js";
import otpGenerator from "otp-generator";
import axios from "axios";
import twilio from "twilio";

export const registerWorker = async (req, res) => {
  const {
    firstName,
    lastName,
    mobileNumber,
    password,
    country,
    state,
    localAddress,
    userType = "worker", 
  } = req.body;
  try {
    if (
      !firstName ||
      !lastName ||
      !mobileNumber ||
      !password ||
      !country ||
      !state
    ) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }

    // Check if userType is valid
    if (userType !== "worker" && userType !== "client") {
      return res.status(400).json({
        message: "Invalid user type. Must be 'worker' or 'client'",
        success: false,
      });
    }

    // Check if user already exists in the appropriate collection
    let existingUser;
    if (userType === "worker") {
      existingUser = await Worker.findOne({ mobileNumber });
    } else {
      existingUser = await Client.findOne({ mobileNumber });
    }

    if (existingUser) {
      return res.status(400).json({
        message: `${
          userType.charAt(0).toUpperCase() + userType.slice(1)
        } is already registered`,
        success: false,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (userType === "worker") {
      await Worker.create({
        firstName,
        lastName,
        mobileNumber,
        password: hashedPassword,
        country,
        state,
        localAddress,
      });
    } else {
      await Client.create({
        firstName,
        lastName,
        mobileNumber,
        password: hashedPassword,
        country,
        state,
        localAddress,
      });
    }

    return res.status(201).json({
      message: `${
        userType.charAt(0).toUpperCase() + userType.slice(1)
      } registered successfully`,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

export const loginWorker = async (req, res) => {
  const { mobileNumber, password, userType } = req.body;
  try {
    if (!mobileNumber || !password || !userType) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }

    // Check if userType is valid
    if (userType !== "worker" && userType !== "client") {
      return res.status(400).json({
        message: "Invalid user type. Must be 'worker' or 'client'",
        success: false,
      });
    }

    let user;
    if (userType === "worker") {
      user = await Worker.findOne({ mobileNumber });
    } else {
      user = await Client.findOne({ mobileNumber });
    }

    if (!user) {
      return res.status(400).json({
        message: `${
          userType.charAt(0).toUpperCase() + userType.slice(1)
        } not found`,
        success: false,
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({
        message: "Invalid mobilenumber or password",
        success: false,
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        userType: userType,
      },
      process.env.SECRET_KEY,
      {
        expiresIn: "1d",
      }
    );

    const userData = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      mobileNumber: user.mobileNumber,
      country: user.country,
      state: user.state,
      localAddress: user.localAddress,
      profilePicture: user.profilePicture,
      userType: userType,
    };

    return res
      .cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        sameSite: "none",
        secure: true,
      })
      .json({
        message: "Login successfully",
        success: true,
        token,
        user: userData,
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const logout = async (req, res) => {
  try {
    // Clear the authentication cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    return res.status(200).json({
      message: "Logged out successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

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
    try {
      await twilioClient.messages.create({
        body: `Thanks for signing up on WorkMate!
Your OTP is: ${otpCode}

Valid for 5 minutes. Please do not share this with anyone.

— Team WorkMate `,
        to: mobileNumber, // e.g. +919999999999
        from: process.env.TWILIO_PHONE_NUMBER,
      });
    } catch (twilioError) {
      console.error("Twilio Error:", twilioError);
      // For development/testing, you can log the OTP instead of sending SMS
      console.log(`OTP for ${mobileNumber}: ${otpCode}`);

      // Return success even if Twilio fails (for development)
      // In production, you should handle this differently
    }

    // Ensure international format
    let formattedNumber = mobileNumber;
    if (!formattedNumber.startsWith("+")) {
      formattedNumber = `+91${formattedNumber}`;
    }

    await Otp.create({
      mobileNumber: formattedNumber,
      otp: otpCode,
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("OTP Generation Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const verifyOtp = async (req, res) => {
  const { mobileNumber, otp } = req.body;

  try {
    // Validate input
    if (!mobileNumber || !otp) {
      return res.status(400).json({
        success: false,
        message: "Mobile number and OTP are required",
      });
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
      message: "Internal server error",
      success: false,
    });
  }
};

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const { userId, userType } = req.user;

    let user;
    if (userType === "worker") {
      user = await Worker.findById(userId).select("-password");
    } else {
      user = await Client.findById(userId).select("-password");
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: { ...user.toObject(), userType },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { userId, userType } = req.user;
    const updateData = req.body;

    // Remove sensitive fields that shouldn't be updated
    delete updateData.password;
    delete updateData.mobileNumber;
    delete updateData._id;

    let user;
    if (userType === "worker") {
      user = await Worker.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
      }).select("-password");
    } else {
      user = await Client.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
      }).select("-password");
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: { ...user.toObject(), userType },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// Upload profile picture
export const uploadProfilePicture = async (req, res) => {
  try {
    const { userId, userType } = req.user;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Profile picture is required",
      });
    }

    // Create the full URL for the uploaded file
    const baseUrl =
      process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 8000}`;
    const profilePictureUrl = `${baseUrl}/${req.file.path}`;

    let user;
    if (userType === "worker") {
      user = await Worker.findByIdAndUpdate(
        userId,
        { profilePicture: profilePictureUrl },
        { new: true }
      ).select("-password");
    } else {
      user = await Client.findByIdAndUpdate(
        userId,
        { profilePicture: profilePictureUrl },
        { new: true }
      ).select("-password");
    }

    return res.status(200).json({
      success: true,
      message: "Profile picture updated successfully",
      profilePicture: profilePictureUrl,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// Get client profile by ID
export const getClientById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Client ID is required",
      });
    }

    const client = await Client.findById(id).select("-password");

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    return res.status(200).json({
      success: true,
      client,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};
