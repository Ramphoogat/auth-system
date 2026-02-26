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
import activityRoutes from "./src/routes/activityRoutes.js";
import { performSheetSync } from "./src/controllers/sheetController.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: process.env.CLIENT_URL || "*", 
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Handle favicon and meta.json to prevent 404s
app.get('/favicon.ico', (req, res) => res.status(204).end());
app.get('/meta.json', (req, res) => res.status(204).end());

// Ensure DB is connected before any route runs
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/sheets", sheetRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/activity", activityRoutes);

app.get("/api", (req, res) => {
  res.json({
    message: "API is running",
    endpoints: [
      "/api/auth",
      "/api/settings",
      "/api/sheets",
      "/api/calendar",
      "/api/activity"
    ]
  });
});

app.get("/", (req, res) => {
  res.send("MERN Auth Server is running");
});

// MongoDB Connection

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  
  if (!process.env.MONGO_URI) {
    console.error("No MONGO_URI provided. Server cannot connect to MongoDB.");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB via URI");
    return;
  } catch (err) {
    console.error("Crucial MongoDB connection error:", err);
    process.exit(1);
  }
};



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
