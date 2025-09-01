import express from "express";
import {
  getAllJobs,
  postJob,
  getJobById,
} from "../controllers/job.controller.js";
import { upload } from "../middlewares/multer.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

// Route to handle job posting with images
router.route("/postjob").post(isAuthenticated, upload.array("images"), postJob);
router.route("/getjobs").get(getAllJobs);
router.route("/getjob/:id").get(getJobById);

export default router;
