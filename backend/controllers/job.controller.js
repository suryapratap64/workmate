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
