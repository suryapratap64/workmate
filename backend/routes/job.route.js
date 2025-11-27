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
  searchJobsByTitle,
} from "../controllers/job.controller.js";
import { upload } from "../middlewares/multer.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();
router.route("/search").get(searchJobsByTitle);
router.route("/postjob").post(isAuthenticated, upload.array("images"), postJob);
router.route("/apply/:id").post(isAuthenticated, applyToJob);
router.route("/myapplications").get(isAuthenticated, getMyApplications);
router.route("/myjobs").get(isAuthenticated, getMyJobs);
router.route("/getjobs").get(getAllJobs);
router.route("/getjob/:id").get(getJobById);

router
  .route("/applicant/:jobId/:applicantId")
  .patch(isAuthenticated, updateApplicantStatus);

router.route("/status/:id").patch(isAuthenticated, updateJobStatus);

export default router;
