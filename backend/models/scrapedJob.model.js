import mongoose from "mongoose";

const scrapedJobSchema = new mongoose.Schema(
  {
    uniqueId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      default: "Not specified",
      trim: true,
      index: true,
    },
    salary: {
      type: String,
      default: "Not disclosed",
    },
    salaryMin: {
      type: Number,
      default: 0,
    },
    salaryMax: {
      type: Number,
      default: 0,
    },
    jobType: {
      type: String,
      default: "Full-time",
      index: true,
      // Allow any job type: Full-time, Part-time, Contract, Freelance, Temporary, Internship, etc.
    },
    platform: {
      type: String,
      required: true,
      index: true,
      // Allow any platform name, not just hardcoded list
      // Supported: LinkedIn, Indeed, Glassdoor, Stack Overflow, GitHub Jobs, AngelList,
      // RemoteOk, FlexJobs, WeWork, Upwork, Internshala, Naukri, etc.
    },
    description: {
      type: String,
      default: "",
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    experience: {
      type: String,
      default: "Not specified",
      index: true,
    },
    applyLink: {
      type: String,
      required: true,
    },
    companyLogo: {
      type: String,
      default: null,
    },
    postedDate: {
      type: Date,
      required: false,
      index: true, // Index for sorting and filtering
    },
    scrapedDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    source: {
      type: String,
      default: "web-scraper",
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    applications: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for frequently searched fields
scrapedJobSchema.index({ title: "text", description: "text", skills: "text" });
scrapedJobSchema.index({ platform: 1, isActive: 1 });
scrapedJobSchema.index({ location: 1, jobType: 1, experience: 1 });

export default mongoose.model("ScrapedJob", scrapedJobSchema);
