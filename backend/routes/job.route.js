import express from "express";
import {
  getAllJobs,
  postJob,
  getJobById,
  applyToJob,
  getMyApplications,
  getMyJobs,
  updateApplicantStatus,
  updateJobStatus,
} from "../controllers/job.controller.js";
import { upload } from "../middlewares/multer.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

// Route to handle job posting with images
router.route("/postjob").post(isAuthenticated, upload.array("images"), postJob);
// Worker apply endpoint
router.route("/apply/:id").post(isAuthenticated, applyToJob);
// Get logged-in worker's applications
router.route("/myapplications").get(isAuthenticated, getMyApplications);
// Client: get jobs posted by logged in client
router.route("/myjobs").get(isAuthenticated, getMyJobs);
router.route("/getjobs").get(getAllJobs);
router.route("/getjob/:id").get(getJobById);
// Client updates an applicant's status
router
  .route("/applicant/:jobId/:applicantId")
  .patch(isAuthenticated, updateApplicantStatus);
// Client updates job status (open/closed)
router.route("/status/:id").patch(isAuthenticated, updateJobStatus);

export default router;
