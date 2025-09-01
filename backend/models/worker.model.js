import mongoose from "mongoose";
const workerSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    email: { type: String, default: "" },
    password: { type: String, required: true },
    profilePicture: { type: String, default: "" },
    bio: { type: String, default: "" },
    country: { type: String, required: true },
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
