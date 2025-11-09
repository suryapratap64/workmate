import mongoose from "mongoose";
const workerSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    mobileNumber: {
      type: String,
      required: function () {
        // Required only if not signed up with Google
        return !this.isGoogleSignup;
      },
    },
    email: { type: String, default: null },
    password: {
      type: String,
      required: function () {
        // Required only if not signed up with Google
        return !this.isGoogleSignup;
      },
    },
    isGoogleSignup: { type: Boolean, default: false },
    isProfileComplete: { type: Boolean, default: false },
    profilePicture: { type: String, default: "" },
    bio: { type: String, default: "" },
    country: { type: String, default: "India" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    localAddress: { type: String, default: "" },
    skills: [{ type: String }],
    hourlyRate: { type: Number, default: 0 },
    experience: { type: String, default: "" },
    education: { type: String, default: "" },
    portfolio: [{ type: String }],
    availability: { type: String, default: "Available" },
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    completedJobs: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    // Wallet balance in smallest currency unit (e.g., cents) or main currency depending on app conventions
    walletBalance: { type: Number, default: 0 },
    languages: [{ type: String }],
    certifications: [{ type: String }],
    socialLinks: {
      linkedin: { type: String, default: "" },
      github: { type: String, default: "" },
      website: { type: String, default: "" },
    },
  },
  { timestamps: true }
);
export const Worker = mongoose.model("Worker", workerSchema);
