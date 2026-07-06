import mongoose from "mongoose";
import { ENV } from "../../env.js";

export const connect_db = async () => {
  try {
    const MONGO_URI = ENV.MONGO_URI;
    if (!MONGO_URI) throw new Error("MONGO_URI is not defined");
    const conn = await mongoose.connect(MONGO_URI);
    console.log("Database Connected");
  } catch (error) {
    console.log("Error connecting MongoDB", error);
    process.exit(1);
  }
};
