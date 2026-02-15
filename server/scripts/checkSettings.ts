
import mongoose from "mongoose";
import dotenv from "dotenv";
import SystemSettings from "../src/models/SystemSettings.js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.env") });

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI not found");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");
    
    const settings = await SystemSettings.find({});
    console.log("Current SystemSettings:", JSON.stringify(settings, null, 2));
    
    await mongoose.disconnect();
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
};

connectDB();
