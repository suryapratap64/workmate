import express, { urlencoded } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './utils/db.js';
import userRoute from './routes/user.route.js';
import cookieParser from 'cookie-parser';
import jobRoute from './routes/job.route.js';

 dotenv.config();


const app=express();
const Port=process.env.PORT||8000;
//Middleware
app.use(express.json());
app.use(cookieParser());

app.use(urlencoded({extended:true}))
const corsOptions={
    origin:'http://localhost:5173',
    credentials:true
}

app.use(cors(corsOptions));









app.get("/",(req,res)=>{
    return res.status(200).json({
        message:"I am comming from backend",
         success:true
    })

})
//Api for user
app.use("/api/v1/user",userRoute);

//Api for job handlers
app.use("/api/v1/job",jobRoute);


app.listen(Port,()=>{
    connectDB();
    console.log(`server is running on PORT ${Port}`);
})
