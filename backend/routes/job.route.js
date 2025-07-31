import express from 'express'
import { getAllJobs, postJob } from '../controllers/job.controller.js';
import upload from '../middlewares/multer.js';

const router=express.Router();

// Route to handle job posting with images
router.route('/postjob').post(upload.array('images'), postJob);
router.route('/getjobs').get(getAllJobs);

export default router