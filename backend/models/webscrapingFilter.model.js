import mongoose from "mongoose";

const webscrapingFilterSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
      default: null,
    },
    filterName: {
      type: String,
      trim: true,
      default: "Default Filter",
    },
    location: [
      {
        type: String,
        trim: true,
      },
    ],
    platforms: [
      {
        type: String,
        enum: [
          "LinkedIn",
          "Indeed",
          "Glassdoor",
          "Stack Overflow",
          "GitHub Jobs",
          "AngelList",
          "RemoteOk",
          "FlexJobs",
          "WeWork",
          "Upwork",
        ],
      },
    ],
    jobTypes: [
      {
        type: String,
        enum: ["Full-Time", "Part-Time", "Contract", "Freelance", "Temporary"],
      },
    ],
    experienceLevels: [
      {
        type: String,
        enum: ["Entry Level", "Mid Level", "Senior", "Executive"],
      },
    ],
    salaryRange: {
      min: {
        type: Number,
        default: 0,
      },
      max: {
        type: Number,
        default: 1000000,
      },
    },
    keywords: [
      {
        type: String,
        trim: true,
      },
    ],
    excludeKeywords: [
      {
        type: String,
        trim: true,
      },
    ],
    isDefault: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("WebscrapingFilter", webscrapingFilterSchema);
