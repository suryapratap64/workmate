import mongoose from "mongoose";
import { Worker } from "../models/worker.model.js";
import { Client } from "../models/client.model.js";
import Job from "../models/job.model.js";
import { Payment } from "../models/payment.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Otp } from "../models/otp.model.js";
import otpGenerator from "otp-generator";
import axios from "axios";
import twilio from "twilio";
import admin from "../lib/firebaseAdmin.js";
import cloudinary from "../utils/cloudinary.js";
export const registerWithGoogle = async (req, res) => {
  const {
    idToken,
    firstName,
    lastName,
    email,
    mobileNumber,
    country,
    state,
    localAddress,
    userType,
    profilePicture,
  } = req.body;

  try {
    if (!idToken) {
      return res.status(400).json({
        message: "Firebase ID token is required",
        success: false,
      });
    }

    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // If we don't get an email from the token, return error
    if (!decodedToken.email) {
      return res.status(400).json({
        message: "Email is required for registration",
        success: false,
      });
    }

    // Check if user already exists
    let existingUser;
    const orConditions = [{ email: decodedToken.email }];

    if (mobileNumber) {
      orConditions.push({ mobileNumber });
    }

    if (userType === "worker") {
      existingUser = await Worker.findOne({ $or: orConditions });
    } else {
      existingUser = await Client.findOne({ $or: orConditions });
    }

    // If user exists, sign them in
    if (existingUser) {
      const token = jwt.sign(
        {
          userId: existingUser._id,
          userType: userType,
        },
        process.env.SECRET_KEY,
        {
          expiresIn: "1d",
        }
      );

      const userData = {
        _id: existingUser._id,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        email: existingUser.email,
        mobileNumber: existingUser.mobileNumber,
        country: existingUser.country,
        state: existingUser.state,
        localAddress: existingUser.localAddress,
        profilePicture: existingUser.profilePicture,
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
          success: true,
          message: "Logged in successfully",
          token,
          user: userData,
        });
    }

    // If user doesn't exist, create a new one
    const userData = {
      firstName: firstName || decodedToken.name?.split(" ")[0] || "",
      lastName:
        lastName || decodedToken.name?.split(" ").slice(1).join(" ") || "",
      email: decodedToken.email,
      mobileNumber: mobileNumber || "",
      password: "", // No password for Google auth
      country: country || "India",
      state: state || "",
      localAddress: localAddress || "",
      profilePicture: profilePicture || decodedToken.picture || "",
      isEmailVerified: true,
      firebaseUid: decodedToken.uid,
      isGoogleSignup: true,
      isProfileComplete: false,
    };

    let newUser;
    if (userType === "worker") {
      newUser = await Worker.create(userData);
    } else {
      newUser = await Client.create(userData);
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: newUser._id,
        userType: userType,
      },
      process.env.SECRET_KEY,
      {
        expiresIn: "1d",
      }
    );

    const responseUser = {
      _id: newUser._id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      mobileNumber: newUser.mobileNumber,
      country: newUser.country,
      state: newUser.state,
      localAddress: newUser.localAddress,
      profilePicture: newUser.profilePicture,
      userType: userType,
    };

    return res
      .cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        sameSite: "none",
        secure: true,
      })
      .status(201)
      .json({
        message: "Registered successfully with Google",
        success: true,
        token,
        user: responseUser,
      });
  } catch (error) {
    console.error("Google registration error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const registerWorker = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    idToken,
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
    // // Verify Firebase ID token (issued after OTP verification)
    // const decoded = await admin.auth().verifyIdToken(idToken);

    // // decoded.phone_number contains the phone
    // const phone = decoded.phone_number;
    // if (!phone)
    //   return res
    //     .status(400)
    //     .json({ success: false, message: "No phone in token" });

    // If frontend passed a Firebase idToken (from phone/email/oauth flows),
    // verify it and extract the email if available. This covers flows where
    // the client completed auth with Firebase and didn't include an email
    // string in the request body.
    let effectiveEmail = email;
    if (!effectiveEmail && idToken) {
      try {
        const decoded = await admin.auth().verifyIdToken(idToken);
        // decoded.email may be present for OAuth/email sign-ins
        if (decoded && decoded.email) {
          effectiveEmail = decoded.email;
        }
      } catch (err) {
        console.log(
          "Failed to verify idToken in registerWorker:",
          err.message || err
        );
        // don't block registration just because token verification failed;
        // fallback to behavior below (email may be empty)
      }
    }

    // Check if user already exists in the appropriate collection (by email or mobile number)
    let existingUser;
    // Build query conditions: include email if available, always check mobileNumber
    const orConditions = [];
    if (effectiveEmail) {
      orConditions.push({ email: effectiveEmail });
    }
    if (mobileNumber) {
      orConditions.push({ mobileNumber });
    }

    if (orConditions.length > 0) {
      if (userType === "worker") {
        existingUser = await Worker.findOne({ $or: orConditions });
      } else {
        existingUser = await Client.findOne({ $or: orConditions });
      }
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

    const baseData = {
      firstName,
      lastName,
      mobileNumber,
      password: hashedPassword,
      country,
      state,
      localAddress,
      email,
    };

    if (userType === "worker") {
      await Worker.create(baseData);
    } else {
      await Client.create(baseData);
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

    let profilePictureUrl;

    // If in production, use Cloudinary
    if (process.env.NODE_ENV === "production") {
      try {
        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "workmate/profile-pictures",
          width: 500,
          height: 500,
          crop: "fill",
        });
        profilePictureUrl = result.secure_url;
      } catch (error) {
        console.error("Cloudinary upload error:", error);
        return res.status(500).json({
          success: false,
          message: "Failed to upload profile picture",
        });
      }
    } else {
      // In development, use local URL
      const baseUrl =
        process.env.BACKEND_URL ||
        `http://localhost:${process.env.PORT || 8000}`;
      profilePictureUrl = `${baseUrl}/${req.file.path}`;
    }

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

// Get list of workers with optional search and pagination
export const getWorkers = async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    const filters = {};

    if (q) {
      // Search firstName, lastName, bio, skills
      const regex = new RegExp(q, "i");
      filters.$or = [
        { firstName: regex },
        { lastName: regex },
        { bio: regex },
        { skills: regex },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Worker.countDocuments(filters);
    const workers = await Worker.find(filters)
      .select("-password")
      .skip(skip)
      .limit(Number(limit))
      .lean();

    return res.status(200).json({
      success: true,
      data: { workers, total, page: Number(page), limit: Number(limit) },
    });
  } catch (error) {
    console.log("getWorkers error", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// Get any user (worker or client) by ID for public profile view
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "User id is required" });
    }

    // Validate id is a valid ObjectId to avoid Mongoose CastError for strings like 'profile'
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user id" });
    }

    // Try worker first
    let user = await Worker.findById(id).select("-password");
    if (user) {
      return res.status(200).json({
        success: true,
        user: { ...user.toObject(), userType: "worker" },
      });
    }

    // Then try client
    user = await Client.findById(id).select("-password");
    if (user) {
      return res.status(200).json({
        success: true,
        user: { ...user.toObject(), userType: "client" },
      });
    }

    return res.status(404).json({ success: false, message: "User not found" });
  } catch (error) {
    console.log("getUserById error", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// Dashboard stats for authenticated user (client or worker)
export const getDashboardStats = async (req, res) => {
  try {
    const { userId, userType } = req.user;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    if (userType === "client") {
      // client-specific stats
      const totalJobs = await Job.countDocuments({ client: userId });
      const activeJobs = await Job.countDocuments({
        client: userId,
        status: "open",
      });
      const completedJobs = await Job.countDocuments({
        client: userId,
        status: "closed",
      });

      const totalSpentAgg = await Payment.aggregate([
        {
          $match: { user: new mongoose.Types.ObjectId(userId), type: "payout" },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);
      const totalSpent = (totalSpentAgg[0] && totalSpentAgg[0].total) || 0;

      const thisMonthAgg = await Payment.aggregate([
        {
          $match: {
            user: new mongoose.Types.ObjectId(userId),
            type: "payout",
            createdAt: { $gte: startOfMonth },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);
      const thisMonth = (thisMonthAgg[0] && thisMonthAgg[0].total) || 0;

      // recent workers (from applicants to client's jobs)
      const jobs = await Job.find({ client: userId })
        .select("applicants title")
        .lean();
      const applicants = [];
      for (const job of jobs) {
        (job.applicants || []).forEach((a) => {
          const worker = a.worker || {};
          applicants.push({
            workerId: worker._id || worker,
            appliedAt: a.appliedAt,
            jobTitle: job.title,
          });
        });
      }
      applicants.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
      const seen = new Set();
      const recentWorkers = [];
      for (const a of applicants) {
        const wid = String(a.workerId);
        if (!wid || seen.has(wid)) continue;
        seen.add(wid);
        recentWorkers.push(a);
        if (recentWorkers.length >= 5) break;
      }

      return res.status(200).json({
        success: true,
        stats: { totalJobs, activeJobs, completedJobs, totalSpent, thisMonth },
        recentWorkers,
      });
    }

    if (userType === "worker") {
      const worker = await Worker.findById(userId).lean();
      if (!worker)
        return res
          .status(404)
          .json({ success: false, message: "Worker not found" });

      const totalEarnings = worker.totalEarnings || 0;
      const completedJobs = worker.completedJobs || 0;
      const avgRating = worker.rating || 0;

      const thisMonthAgg = await Payment.aggregate([
        {
          $match: { "metadata.toWorker": new mongoose.Types.ObjectId(userId) },
        },
        { $match: { createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);
      const thisMonth = (thisMonthAgg[0] && thisMonthAgg[0].total) || 0;

      // recent applications are derived from job.myApplication stored elsewhere; we'll return recent applications from Job where applicants contain this worker
      const jobs = await Job.find({
        "applicants.worker": new mongoose.Types.ObjectId(userId),
      })
        .select("title prize applicants")
        .lean();
      const recentApplications = [];
      for (const job of jobs) {
        const app = (job.applicants || []).find(
          (a) => String(a.worker) === String(userId)
        );
        if (app) {
          recentApplications.push({
            jobId: job._id,
            title: job.title,
            prize: job.prize,
            status: app.status,
            appliedAt: app.appliedAt,
          });
        }
      }
      recentApplications.sort(
        (a, b) => new Date(b.appliedAt) - new Date(a.appliedAt)
      );

      return res.status(200).json({
        success: true,
        stats: { totalEarnings, completedJobs, avgRating, thisMonth },
        recentApplications: recentApplications.slice(0, 5),
      });
    }

    return res
      .status(400)
      .json({ success: false, message: "Invalid user type" });
  } catch (error) {
    console.error("getDashboardStats error", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
