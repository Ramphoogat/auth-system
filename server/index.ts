import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./src/routes/authRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors({
    origin: process.env.CLIENT_URL || "*", 
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
app.use(express.json());

// Handle favicon and meta.json to prevent 404s
app.get('/favicon.ico', (req, res) => res.status(204).end());
app.get('/meta.json', (req, res) => res.status(204).end());

// Routes
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("MERN Auth Server is running");
});

// MongoDB Connection
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  if (!process.env.MONGO_URI) return;
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
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
        });
    });
}

export default app;
