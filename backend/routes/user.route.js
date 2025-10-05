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
} from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { uploadProfile } from "../middlewares/multer.js";

const router = express.Router();
router.route("/register").post(registerWorker);
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

// Client routes
router.route("/client/:id").get(getClientById);

// Public user by id (must come after specific routes)
router.route("/:id").get(getUserById);

export default router;
