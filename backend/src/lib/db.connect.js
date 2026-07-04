import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export const connect_db = async () => {
  const MONGO_URI = process.env.MONGO_URI;
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Database Connected");
  } catch (error) {
    console.log("Error connecting MongoDB", error);
    process.exit(1);
  }
};
