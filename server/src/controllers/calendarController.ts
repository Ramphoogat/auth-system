import { Request, Response } from "express";
import CalendarData from "../models/CalendarData.js";

/**
 * GET /api/calendar
 * Returns the authenticated user's saved events and ranges.
 */
export const getCalendarData = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const doc = await CalendarData.findOne({ userId });

    if (!doc) return res.status(200).json({ events: [], ranges: [] });

    return res.status(200).json({ events: doc.events, ranges: doc.ranges });
  } catch (err) {
    console.error("getCalendarData error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * PUT /api/calendar
 * Upserts the full calendar state for the authenticated user.
 * Body: { events: CalendarEvent[], ranges: DateRange[] }
 */
export const saveCalendarData = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { events = [], ranges = [] } = req.body;

    const doc = await CalendarData.findOneAndUpdate(
      { userId },
      { $set: { events, ranges } },
      { upsert: true, new: true }
    );

    return res.status(200).json({ events: doc.events, ranges: doc.ranges });
  } catch (err) {
    console.error("saveCalendarData error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
