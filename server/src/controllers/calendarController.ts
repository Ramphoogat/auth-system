import { Request, Response } from "express";
import CalendarData from "../models/CalendarData.js";
import User from "../models/Users.js";
import { google } from "googleapis";

/** 
 * Section: Database Operations
 * These functions handle basic CRUD operations for calendar data in the local MongoDB.
 */

// Removes all calendar events belonging to the authenticated user from the local database.
export const clearAllEvents = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    await CalendarData.findOneAndUpdate(
      { userId },
      { $set: { events: [] } },
      { upsert: true }
    );

    console.log(`Cleared all events from DB for user ${userId}`);
    return res.status(200).json({ message: "All events cleared", events: [], ranges: [] });
  } catch (err) {
    console.error("clearAllEvents error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Retrieves the user's stored calendar events and date ranges from the local database.
export const getCalendarData = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    let doc = await CalendarData.findOneAndUpdate(
      { userId },
      { $setOnInsert: { events: [], ranges: [] } },
      { upsert: true, new: true }
    );

    if (!doc) {
      return res.status(500).json({ message: "Failed to load calendar data" });
    }

    return res.status(200).json({ events: doc.events, ranges: doc.ranges });
  } catch (err) {
    console.error("getCalendarData error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Section: Google Calendar Synchronization (Reading)
 * Synchronizes the local database with the user's Google Calendar.
 * It fetches the latest events and removes local copies that have been deleted remotely.
 */
export const syncGoogleCalendar = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    let doc = await CalendarData.findOneAndUpdate(
      { userId },
      { $setOnInsert: { events: [], ranges: [] } },
      { upsert: true, new: true }
    );

    if (!doc) {
      return res.status(500).json({ message: "Failed to load calendar data for sync" });
    }

    const user = await User.findById(userId);
    let googleCalendarTokensReady = !!(user && user.googleAccessToken);

    if (googleCalendarTokensReady && user) {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
      );
      oauth2Client.setCredentials({
        access_token: user.googleAccessToken,
        refresh_token: user.googleRefreshToken,
      });

      const calendar = google.calendar({ version: "v3", auth: oauth2Client });

      try {
        // --- 1. Fetch Remote Events ---
        // Defines the time window (last year to next year) for synchronization.
        const timeMin = new Date();
        timeMin.setFullYear(timeMin.getFullYear() - 1);
        const timeMax = new Date();
        timeMax.setFullYear(timeMax.getFullYear() + 1);

        const googleEventIds = new Set();

        try {
          const response = await calendar.events.list({
            calendarId: "primary",
            timeMin: timeMin.toISOString(),
            timeMax: timeMax.toISOString(),
            singleEvents: true,
            orderBy: "startTime",
          });
          const items = response.data.items || [];
          items.forEach(e => googleEventIds.add(e.id));
        } catch (err: any) {
          console.error(`Error fetching from primary calendar:`, err?.message || err);
        }

        // --- 2. Reconcile Deletions ---
        // Removes local database records if the corresponding Google Calendar event no longer exists.
        doc.events = doc.events.filter((e: any) => {
          if (e.googleEventId && !googleEventIds.has(e.googleEventId)) {
            return false; // Event was deleted from Google → remove local copy too
          }
          return true;
        }) as any;


        // --- 3. Finalize Local Data ---
        // Removes temporary external markers before saving the reconciled state.
        doc.events = doc.events.filter((e: any) => !e.id.startsWith("gcal-")) as any;
        await doc.save();
        
        // Return locally-created events and ALL ranges
        return res.status(200).json({ events: doc.events, ranges: doc.ranges });

      } catch (err: any) {
        console.error("Error fetching Google Calendar events:", err?.response?.data || err?.message || err);
        // If the user's token is unauthorized or has insufficient scopes, clear it from DB so it stops failing
        if (err?.code === 401 || err?.code === 403 || err?.response?.status === 401 || err?.response?.status === 403) {
           console.log("Token invalid or missing scopes. Prompt user to re-link Google.");
           user.googleAccessToken = undefined;
           user.googleRefreshToken = undefined;
           await user.save();
        }
      }
    }

    return res.status(200).json({ events: doc.events, ranges: doc.ranges }); // Fallback if no google sync
  } catch (err) {
    console.error("syncGoogleCalendar error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Section: Calendar Data Persistence (Writing)
 * Saves the user's calendar state and reflects changes (create, update, delete) 
 * back to the user's Google Calendar if authenticated.
 */
export const saveCalendarData = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { events = [], ranges = [] } = req.body;

    const user = await User.findById(userId);
    let googleCalendarTokensReady = !!(user && user.googleAccessToken);

    // Merge existing events to retain googleEventId
    const existingDoc = await CalendarData.findOne({ userId });
    const existingEvents = existingDoc ? existingDoc.events : [];
    const eventMap = new Map(existingEvents.map(e => [e.id, e]));

    // --- 1. Metadata Mapping ---
    // Maps incoming changes to existing records to ensure consistent Google Event IDs.
    const mergedEvents = events.map((e: any) => {
      const existing = eventMap.get(e.id);
      
      let googleEventId = existing ? existing.googleEventId : e.googleEventId;

      // Unpack lost google IDs for externally synced events to avoid duplicating
      if (!googleEventId && e.id && e.id.startsWith("gcal-")) {
          const parts = e.id.split("-");
          if (parts.length >= 3) {
             googleEventId = parts.slice(1, -1).join("-");
          }
      }

      return {
        ...e,
        googleEventId,
      };
    });

    // Merge existing ranges to retain googleEventId
    const existingRanges = existingDoc ? existingDoc.ranges : [];
    const rangeMap = new Map((existingRanges || []).map(r => [r.id, r]));

    const mergedRanges = (ranges || []).map((r: any) => {
      const existing = rangeMap.get(r.id);
      return {
        ...r,
        googleEventId: existing ? existing.googleEventId : r.googleEventId,
      };
    });

    // If Google Calendar Auth is ready, sync to Google Calendar
    if (googleCalendarTokensReady && user) {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
      );
      oauth2Client.setCredentials({
        access_token: user.googleAccessToken,
        refresh_token: user.googleRefreshToken,
      });

      const calendar = google.calendar({ version: "v3", auth: oauth2Client });

      // --- 2. Google Calendar Write Operations ---
      // Utility for handling API rate limits and network retries.
      const executeWithRetry = async (fn: () => Promise<any>, retries = 3) => {
        for (let i = 0; i < retries; i++) {
          try {
            const res = await fn();
            await new Promise(r => setTimeout(r, 200)); // base delay to avoid hitting limit
            return res;
          } catch (err: any) {
            if (i < retries - 1 && (err?.code === 403 || err?.response?.status === 403)) {
              await new Promise(r => setTimeout(r, 1000 * (i + 1))); // exponential backoff
            } else {
              throw err;
            }
          }
        }
      };


      // --- 3. Process Event Deletions ---
      // Identifies and removes events from Google Calendar that are no longer in the local request.
      const incomingEventIds = new Set(mergedEvents.map((e: any) => e.id));
      const deletedFromProject = existingEvents.filter((e: any) => 
        e.googleEventId && !incomingEventIds.has(e.id)
      );

      for (const removed of deletedFromProject) {
        try {
          await executeWithRetry(() => calendar.events.delete({
            calendarId: "primary",
            eventId: removed.googleEventId as string,
          }));
        } catch (err: any) {
          // Silently skip (already deleted, protected, etc.)
        }
      }

      // --- 4. Process Event Upserts (Update or Insert) ---
      // Synchronizes new or modified events to Google Calendar.
      for (let i = 0; i < mergedEvents.length; i++) {
        const e = mergedEvents[i];

        if (e.tags?.includes("google-readonly")) {
          continue;
        }

        const calendarEvent = {
          summary: e.title,
          description: e.description || "",
          start: { dateTime: new Date(e.start).toISOString() },
          end: { dateTime: new Date(e.end).toISOString() },
        };

        try {
          if (e.googleEventId) {
            // Update existing Google Calendar event
            await executeWithRetry(() => calendar.events.update({
              calendarId: "primary",
              eventId: e.googleEventId,
              requestBody: calendarEvent,
            }));
          } else {
            // Create new event on Google Calendar
            const response = await executeWithRetry(() => calendar.events.insert({
              calendarId: "primary",
              requestBody: calendarEvent,
            }));
            if (response.data.id) {
              e.googleEventId = response.data.id;
              e.googleCalendarId = "primary";
            }
          }
        } catch (err: any) {
          // Silently skip errors
        }
      }

      // --- 5. Process Range Synchronizations ---
      // Specifically handles date ranges (all-day events) and mirrors them to Google.
      const incomingRangeIds = new Set(mergedRanges.map((r: any) => r.id));
      const deletedRangesFromProject = (existingRanges || []).filter((r: any) => 
        r.googleEventId && !incomingRangeIds.has(r.id)
      );

      for (const removed of deletedRangesFromProject) {
        try {
          await executeWithRetry(() => calendar.events.delete({
            calendarId: "primary",
            eventId: removed.googleEventId as string,
          }));
        } catch (err: any) {}
      }

      const GOOGLE_COLOR_IDS = ['11', '4', '6', '5', '2', '10', '7', '9', '1', '3', '8'];

      for (let i = 0; i < mergedRanges.length; i++) {
        const r = mergedRanges[i];
        const colorId = GOOGLE_COLOR_IDS[(r.colorIndex ?? i) % GOOGLE_COLOR_IDS.length];
        
        const rangeEvent = {
          summary: r.label || `Range #${i + 1}`,
          description: r.description || "Calendar Range",
          start: { date: new Date(r.start).toISOString().split('T')[0] }, // All-day for ranges
          end: { date: new Date(new Date(r.end).getTime() + 86400000).toISOString().split('T')[0] }, // Google end is exclusive
          colorId: colorId,
        };

        try {
          if (r.googleEventId) {
            await executeWithRetry(() => calendar.events.update({
              calendarId: "primary",
              eventId: r.googleEventId,
              requestBody: rangeEvent,
            }));
          } else {
            const response = await executeWithRetry(() => calendar.events.insert({
              calendarId: "primary",
              requestBody: rangeEvent,
            }));
            if (response.data.id) {
              mergedRanges[i].googleEventId = response.data.id;
              mergedRanges[i].googleCalendarId = "primary";
            }
          }
        } catch (err: any) {}
      }
    }

    // --- 6. Database Persistence ---
    // Saves the final, cleaned state to the local MongoDB.
    const localEventsToSave = mergedEvents.filter((e: any) => !e.id.startsWith("gcal-"));

    const doc = await CalendarData.findOneAndUpdate(
      { userId },
      { $set: { events: localEventsToSave, ranges: mergedRanges } },
      { upsert: true, new: true }
    );

    return res.status(200).json({ events: doc.events, ranges: doc.ranges });
  } catch (err) {
    console.error("saveCalendarData error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
