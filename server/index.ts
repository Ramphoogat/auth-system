// server restart trigger
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./src/routes/authRoutes.js";
import settingsRoutes from "./src/routes/settings.js";
import sheetRoutes from "./src/routes/sheetRoutes.js";
import calendarRoutes from "./src/routes/calendarRoutes.js";
import { performSheetSync } from "./src/controllers/sheetController.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: process.env.CLIENT_URL || "*", 
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true
}));
app.use(express.json());

// Handle favicon and meta.json to prevent 404s
app.get('/favicon.ico', (req, res) => res.status(204).end());
app.get('/meta.json', (req, res) => res.status(204).end());

app.use("/api/auth", authRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/sheets", sheetRoutes);
app.use("/api/calendar", calendarRoutes);

app.get("/", (req, res) => {
  res.send("MERN Auth Server is running");
});

// MongoDB Connection

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  
  // 1. Try connecting to Atlas or configured URI
  if (process.env.MONGO_URI) {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("Connected to MongoDB");
      return;
    } catch (err) {
      console.error("MongoDB connection error:", err);
      console.log("Switching to fallback local database...");
    }
  }

  // 2. Fallback to Memory Server (Dev only)
  try {
    console.log("Starting MongoDB Memory Server...");
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    
    await mongoose.connect(uri);
    console.log("Connected to Local In-Memory MongoDB");
    console.log("WARNING: Data is ephemeral and will be lost on restart.");
  } catch (err) {
    console.error("Failed to start fallback database:", err);
  }
};

// Call connection on every request (serverless compatible)
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Check if run directly (not imported) - typical for local dev
import { pathToFileURL } from 'url';
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    connectDB().then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            
            // Start Google Sheets Background Auto-Sync (Runs every 5 seconds)
            setInterval(() => {
                performSheetSync().catch(err => {
                    console.error("Background Auto Sync Error:", err.message || err);
                });
            }, 5000);
        });
    });
}

export default app;
