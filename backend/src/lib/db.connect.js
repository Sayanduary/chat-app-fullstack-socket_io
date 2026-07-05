import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();

export const connect_db = async () => {
  try {
    const { MONGO_URI } = process.env;
    if (!MONGO_URI) throw new Error("MONGO_URI is not defined");
    const conn = await mongoose.connect(MONGO_URI);
    console.log("Database Connected", conn.connection.host);
  } catch (error) {
    console.log("Error connecting MongoDB", error);
    process.exit(1);
  }
};
