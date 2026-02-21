import express from "express";
import { getCalendarData, saveCalendarData } from "../controllers/calendarController.js";
import { authToken } from "../middleware/auth.js";

const router = express.Router();

// All calendar routes require authentication
router.get("/",  authToken, getCalendarData);
router.put("/",  authToken, saveCalendarData);

export default router;
