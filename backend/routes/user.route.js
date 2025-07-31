import express from 'express';
import {registerWorker,loginWorker, otpGenerate, verifyOtp} from '../controllers/user.controller.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';

const router=express.Router();
router.route('/register').post(registerWorker);
router.route('/login').post(loginWorker);
router.route('/send-otp').post(otpGenerate);
router.route('/verify-otp').post(verifyOtp);


export default router;