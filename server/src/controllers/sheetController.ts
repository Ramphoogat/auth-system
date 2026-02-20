
import { Request, Response } from "express";
import { google } from "googleapis";
import SystemSettings from "../models/SystemSettings.js";
import User from "../models/Users.js";
import { AuthRequest } from "../middleware/auth.js";

// Helper to get authenticated Google Sheets client
const getSheetsClient = () => {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    throw new Error("Missing Google Service Account credentials");
  }

  // Handle potential escaped newlines in private key
  const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');

  /* googleapis v92+ uses object arg for JWT */
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
};

export const connectSheet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { sheetId } = req.body;
    
    if (!req.userId || req.userRole !== 'admin') {
      res.status(403).json({ message: "Admin access required" });
      return;
    }

    if (!sheetId) {
      res.status(400).json({ message: "Sheet ID is required" });
      return;
    }

    // extraction from URL if full URL is provided
    let extractedId = sheetId;
    const match = sheetId.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match) {
        extractedId = match[1];
    }

    // Verify access
    const sheets = getSheetsClient();
    try {
        await sheets.spreadsheets.get({ spreadsheetId: extractedId });
    } catch (apiError: any) {
        console.error("Google Sheets API Error:", apiError);
        res.status(400).json({ 
            message: "Failed to access sheet. Ensure the Service Account has 'Editor' access.",
            details: apiError.message 
        });
        return;
    }

    // Save ID
    let settings = await SystemSettings.findOne();
    if (!settings) {
        settings = new SystemSettings();
    }
    settings.googleSheetId = extractedId;
    await settings.save();

    res.status(200).json({ message: "Sheet connected successfully", sheetId: extractedId });
  } catch (error: any) {
    console.error("Connect Sheet Error:", error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

// Reusable sync function
export const performSheetSync = async (): Promise<void> => {
    const settings = await SystemSettings.findOne();
    if (!settings || !settings.googleSheetId) {
        // No sheet connected, skip
        return;
    }

    const sheets = getSheetsClient();
    const users = await User.find().sort({ createdAt: -1 });

    const header = ["ID", "Name", "Username", "Email", "Role", "Verified", "Created At", "Last Login", "Created By"];
    
    // Helper to sanitize strings for sheets (prevent formula injection)
const sanitize = (val: any) => {
        if (val === null || val === undefined) return "";
        const str = String(val);
        if (['=', '+', '-', '@'].some(char => str.startsWith(char))) {
             return "'" + str;
        }
        return str;
    };

    const rows = users.map(u => {
        try {
            return [
                u._id.toString(),
                sanitize(u.name),
                sanitize(u.username),
                u.email || "",
                u.role || "user",
                u.isVerified ? "Yes" : "No",
                u.createdAt ? new Date(u.createdAt).toISOString() : "",
                u.lastLogin ? new Date(u.lastLogin).toISOString() : "",
                u.createdBy || "Admin"
            ];
        } catch (rowError) {
            console.error("Error processing user row:", u._id, rowError);
            return [u._id.toString(), "ERROR", "ERROR", "", "", "", "", "", ""];
        }
    });

    const values = [header, ...rows];

    let sheetName = "Users";
    try {
        const spreadsheet = await sheets.spreadsheets.get({
            spreadsheetId: settings.googleSheetId
        });
        if (spreadsheet.data.sheets && spreadsheet.data.sheets.length > 0) {
            sheetName = spreadsheet.data.sheets[0].properties?.title || "Users";
        }
    } catch (metaError) {
        console.warn("Could not fetch sheet metadata, defaulting to 'Users'", metaError);
    }

    // Wrap sheet name in single quotes if it contains spaces or special characters
    const rangeName = `'${sheetName.replace(/'/g, "''")}'!A1`;

    // Clear existing content first to avoid duplicates/leftover rows
    const clearRange = `'${sheetName.replace(/'/g, "''")}'!A:Z`;
    try {
        await sheets.spreadsheets.values.clear({
            spreadsheetId: settings.googleSheetId,
            range: clearRange,
        });
    } catch (clearError) {
        console.warn("Could not clear sheet properly before update", clearError);
    }

    // Update with new data
    try {
        await sheets.spreadsheets.values.update({
            spreadsheetId: settings.googleSheetId,
            range: rangeName,
            valueInputOption: "RAW",
            requestBody: { values }
        });
    } catch (googleError: any) {
        console.error("Google Sheets API Update Error:", googleError.response?.data || googleError);
        throw new Error(googleError.response?.data?.error?.message || "Failed to update Google Sheet");
    }

    settings.lastSync = new Date();
    await settings.save();
};

export const syncToSheet = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.userId || req.userRole !== 'admin') {
            res.status(403).json({ message: "Admin access required" });
            return;
        }

        const settings = await SystemSettings.findOne();
        if (!settings || !settings.googleSheetId) {
            res.status(400).json({ message: "No Google Sheet connected" });
            return;
        }

        await performSheetSync();

        // Get count for response message
        const count = await User.countDocuments();
        res.status(200).json({ message: `Synced ${count} users to Google Sheet` });
    } catch (error: any) {
        console.error("Sync To Sheet Error Details:", error);
        res.status(500).json({ 
            message: error.message || "Internal Server Error",
            details: error.response?.data || error.toString()
        });
    }
};


export const getSheetStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const settings = await SystemSettings.findOne();
        res.status(200).json({ 
            connected: !!settings?.googleSheetId, 
            sheetId: settings?.googleSheetId,
            lastSync: settings?.lastSync 
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

