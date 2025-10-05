import sharp from "sharp";
import cloudinary from "../utils/cloudinary.js";
import Job from "../models/job.model.js";

export const postJob = async (req, res) => {
  try {
    const { title, description, prize, location, verified } = req.body;
    const images = req.files; // expecting multiple files
    const { userId, userType } = req.user; // Get the authenticated user's ID and type

    // Check if user is a client (only clients can post jobs)
    if (userType !== "client") {
      return res.status(403).json({
        message: "Only clients can post jobs. Please log in as a client.",
      });
    }

    if (!title || !description || !prize || !location) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Images are optional, so we don't require them
    if (!images) {
      images = [];
    }

    const uploadedImageUrls = [];

    for (const image of images) {
      try {
        // Check if image buffer exists and is valid
        if (!image.buffer || image.buffer.length === 0) {
          console.error("Invalid image buffer for file:", image.originalname);
          continue;
        }

        // Optional: optimize image with error handling
        const optimizedImageBuffer = await sharp(image.buffer)
          .resize({ width: 800, height: 800, fit: "inside" })
          .toFormat("jpeg", { quality: 80 })
          .toBuffer();

        const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString(
          "base64"
        )}`;
        const cloudResponse = await cloudinary.uploader.upload(fileUri);

        uploadedImageUrls.push(cloudResponse.secure_url);
      } catch (imageError) {
        console.error(
          "Error processing image:",
          image.originalname,
          imageError
        );
        // Continue with other images instead of failing completely
        continue;
      }
    }

    const job = await Job.create({
      title,
      description,
      prize,
      location,
      verified: verified === "true",
      images: uploadedImageUrls.length > 0 ? uploadedImageUrls : [], // Use empty array if no images
      client: userId, // Set the client ID from the authenticated user
    });

    res.status(201).json({
      message: "Job posted successfully",
      job,
    });
  } catch (error) {
    console.error("Error posting job:", error);

    // Provide more specific error messages
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Invalid job data. Please check all required fields.",
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        message: "A job with this title already exists.",
      });
    }

    res.status(500).json({
      message: "Server error posting job. Please try again.",
    });
  }
};

export const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate("client", "firstName lastName mobileNumber profilePicture")
      .sort({ createdAt: -1 });
    return res.status(200).json({ jobs, success: true });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Failed to fetch jobs", success: false });
  }
};

export const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ message: "Job ID is required", success: false });
    }

    const job = await Job.findById(id).populate(
      "client",
      "firstName lastName mobileNumber profilePicture"
    );

    if (!job) {
      return res.status(404).json({ message: "Job not found", success: false });
    }

    return res.status(200).json({ job, success: true });
  } catch (error) {
    console.error("Error fetching job by ID:", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch job", success: false });
  }
};

// Worker applies to a job
export const applyToJob = async (req, res) => {
  try {
    const { id } = req.params; // job id
    const { userId, userType } = req.user;
    const { coverLetter = "" } = req.body;

    if (!id) return res.status(400).json({ message: "Job id required" });
    if (userType !== "worker")
      return res.status(403).json({ message: "Only workers can apply" });

    const job = await Job.findById(id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    // prevent duplicate applications
    const already = job.applicants?.some(
      (a) => a.worker?.toString() === userId.toString()
    );
    if (already) return res.status(400).json({ message: "Already applied" });

    job.applicants = job.applicants || [];
    job.applicants.push({ worker: userId, coverLetter, status: "applied" });
    await job.save();

    return res
      .status(200)
      .json({ message: "Applied successfully", success: true });
  } catch (error) {
    console.error("applyToJob error", error);
    return res.status(500).json({ message: "Failed to apply", success: false });
  }
};

// Get jobs the authenticated worker applied to
export const getMyApplications = async (req, res) => {
  try {
    const { userId, userType } = req.user;
    if (userType !== "worker")
      return res
        .status(403)
        .json({ message: "Only workers can view applications" });

    // find jobs where applicants array contains this worker
    const jobs = await Job.find({ "applicants.worker": userId })
      .populate("client", "firstName lastName profilePicture")
      .lean();

    // attach applicant details for this worker
    const results = jobs.map((job) => {
      const applicant = (job.applicants || []).find(
        (a) => a.worker?.toString() === userId.toString()
      );
      return { ...job, myApplication: applicant || null };
    });

    return res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.error("getMyApplications error", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch applications", success: false });
  }
};

// Get jobs posted by the authenticated client
export const getMyJobs = async (req, res) => {
  try {
    const { userId, userType } = req.user;
    if (userType !== "client")
      return res
        .status(403)
        .json({ message: "Only clients can view their jobs" });

    const jobs = await Job.find({ client: userId })
      .populate("client", "firstName lastName profilePicture")
      .populate(
        "applicants.worker",
        "firstName lastName profilePicture mobileNumber"
      )
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    console.error("getMyJobs error", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch jobs", success: false });
  }
};

// Update a specific applicant's status (accept/reject) by the client
export const updateApplicantStatus = async (req, res) => {
  try {
    const { userId, userType } = req.user;
    const { jobId, applicantId } = req.params;
    const { status } = req.body; // status: accepted|rejected

    if (userType !== "client")
      return res
        .status(403)
        .json({ message: "Only clients can update applicant status" });

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (String(job.client) !== String(userId))
      return res.status(403).json({ message: "Not authorized for this job" });

    const applicant = job.applicants.id(applicantId);
    if (!applicant)
      return res.status(404).json({ message: "Applicant not found" });

    applicant.status = status;

    await job.save();

    // Return the updated job with populated applicant worker info so frontend can update global state
    const updatedJob = await Job.findById(jobId)
      .populate("client", "firstName lastName profilePicture")
      .populate(
        "applicants.worker",
        "firstName lastName profilePicture mobileNumber"
      )
      .lean();

    return res
      .status(200)
      .json({
        success: true,
        message: "Applicant updated",
        data: { job: updatedJob, applicantId, status },
      });
  } catch (error) {
    console.error("updateApplicantStatus error", error);
    return res
      .status(500)
      .json({ message: "Failed to update applicant", success: false });
  }
};

// Update job status (open/closed) by client
export const updateJobStatus = async (req, res) => {
  try {
    const { userId, userType } = req.user;
    const { id } = req.params;
    const { status } = req.body; // open|closed

    if (userType !== "client")
      return res
        .status(403)
        .json({ message: "Only clients can update job status" });

    if (!["open", "closed"].includes(status)) {
      return res.status(400).json({ message: "Invalid job status" });
    }

    const job = await Job.findById(id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (String(job.client) !== String(userId))
      return res.status(403).json({ message: "Not authorized for this job" });

    job.status = status;
    await job.save();

    const updatedJob = await Job.findById(id)
      .populate("client", "firstName lastName profilePicture")
      .populate(
        "applicants.worker",
        "firstName lastName profilePicture mobileNumber"
      )
      .lean();

    return res
      .status(200)
      .json({ success: true, message: "Job status updated", data: updatedJob });
  } catch (error) {
    console.error("updateJobStatus error", error);
    return res
      .status(500)
      .json({ message: "Failed to update job status", success: false });
  }
};
