import express from "express";
import {
  registerWorker,
  loginWorker,
  logout,
  otpGenerate,
  verifyOtp,
  getProfile,
  updateProfile,
  uploadProfilePicture,
  getUserById,
  getClientById,
  getWorkers,
  getDashboardStats,
  registerWithGoogle,
} from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { uploadProfile } from "../middlewares/multer.js";
import {
  getWallet,
  depositFunds,
  payoutToWorker,
} from "../controllers/payment.controller.js";

const router = express.Router();
router.route("/register").post(registerWorker);
router.route("/google-register").post(registerWithGoogle);
router.route("/login").post(loginWorker);
router.route("/logout").post(isAuthenticated, logout);
router.route("/send-otp").post(otpGenerate);
router.route("/verify-otp").post(verifyOtp);
router.route("/workers").get(getWorkers);
// Note: place dynamic id route after fixed routes (profile, client) to avoid matching
// literal paths like /profile as an id.

// Profile routes
router.route("/profile").get(isAuthenticated, getProfile);
router.route("/profile").put(isAuthenticated, updateProfile);
router
  .route("/profile/picture")
  .post(
    isAuthenticated,
    uploadProfile.single("profilePicture"),
    uploadProfilePicture
  );

// Payment / wallet routes (clients only)
router.route("/wallet").get(isAuthenticated, getWallet);
router.route("/wallet/deposit").post(isAuthenticated, depositFunds);
router.route("/wallet/payout").post(isAuthenticated, payoutToWorker);

// Dashboard stats
router.route("/dashboard").get(isAuthenticated, getDashboardStats);

// Client routes
router.route("/client/:id").get(getClientById);

// Public user by id (must come after specific routes)
router.route("/:id").get(getUserById);

export default router;
