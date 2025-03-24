import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

const app=express();
dotenv.config();

app.use(cors({origin:"http://localhost:3000",credentials:true}));
app.use(express.json());
app.use(cookieParser());

// try{
//     // console.log(process.env.MONGO_URI)
//     await mongoose.connect(process.env.MONGO_URI);
//     console.log("Connected to mongoDb")
// }catch(err){
//     console.log(err);
// }

// app.use("/api/auth",authRoute);

// app.use((err,req,res,next)=>{
//     const errorStatus=err.status||500;
//     const errorMessage=err.message||"Something went wrong!";

//     return res.status(errorStatus).send(errorMessage);
// })

app.listen(8000,()=>{
    console.log(`Backend server is running on port ${8000}`)
})