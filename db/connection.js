import mongoose from "mongoose";
import "dotenv/config"



export const connection = mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("DB connected successfully"))
  .catch((err) => console.error("DB connection error:", err));