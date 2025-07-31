import mongoose from 'mongoose';
const otpSchema=new mongoose.Schema({
    mobileNumber: String,
    otp: String,
    createdAt: { type: Date, default: Date.now, expires: 1200 }, // expires in 5 minutes
})
export const Otp=mongoose.model('Otp',otpSchema);