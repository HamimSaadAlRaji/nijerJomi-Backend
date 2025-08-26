import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import { v2 as cloudinary } from "cloudinary";
dotenv.config();

import connectDB from "./config/database.js";
import adminRoutes from "./routes/admin.js";
import userRoutes from "./routes/user.js";
import biddingRoute from './routes/bidding.js';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json({limit: "5mb"}));
app.use(express.urlencoded({limit:"5mb", extended: true }));
app.use(cors());
app.use(helmet());
connectDB();

app.use("/api", userRoutes);
app.use("/api", adminRoutes);
app.use("/api/bidding", biddingRoute);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
