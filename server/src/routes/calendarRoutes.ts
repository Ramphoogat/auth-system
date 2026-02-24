import express from "express";
import { getCalendarData, saveCalendarData, syncGoogleCalendar, clearAllEvents } from "../controllers/calendarController.js";
import { authToken } from "../middleware/auth.js";

const router = express.Router();

// All calendar routes require authentication
router.get("/",  authToken, getCalendarData);
router.put("/",  authToken, saveCalendarData);
router.post("/sync", authToken, syncGoogleCalendar);
router.delete("/events", authToken, clearAllEvents);

export default router;
