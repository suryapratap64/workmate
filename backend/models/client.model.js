import mongoose from "mongoose";
const clientSchema = new mongoose.Schema(
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
    companyName: { type: String, default: "" },
    companySize: { type: String, default: "" },
    industry: { type: String, default: "" },
    totalSpent: { type: Number, default: 0 },
    postedJobs: { type: Number, default: 0 },
    hiredWorkers: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    socialLinks: {
      linkedin: { type: String, default: "" },
      website: { type: String, default: "" },
      twitter: { type: String, default: "" },
    },
  },
  { timestamps: true }
);
export const Client = mongoose.model("Client", clientSchema);
