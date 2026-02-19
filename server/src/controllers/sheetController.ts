
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

        const sheets = getSheetsClient();
        const users = await User.find().sort({ createdAt: -1 });

        const header = ["ID", "Name", "Username", "Email", "Role", "Verified", "Created At", "Last Login", "Created By"];
        const rows = users.map(u => [
            u._id.toString(),
            u.name || "",
            u.username,
            u.email,
            u.role,
            u.isVerified ? "Yes" : "No",
            u.createdAt ? new Date(u.createdAt).toISOString() : "",
            u.lastLogin ? new Date(u.lastLogin).toISOString() : "",
            u.createdBy || "Admin"
        ]);

        const values = [header, ...rows];

        // Clear existing and update
        await sheets.spreadsheets.values.update({
            spreadsheetId: settings.googleSheetId,
            range: "Sheet1!A1",
            valueInputOption: "RAW",
            requestBody: { values }
        });

        settings.lastSync = new Date();
        await settings.save();

        res.status(200).json({ message: `Synced ${users.length} users to Google Sheet` });
    } catch (error: any) {
        console.error("Sync To Sheet Error:", error);
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};

export const importFromSheet = async (req: AuthRequest, res: Response): Promise<void> => {
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

        const sheets = getSheetsClient();
        
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: settings.googleSheetId,
            range: "Sheet1!A2:I", // Skip header
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) {
            res.status(200).json({ message: "No data found in sheet to import" });
            return;
        }

        let updatedCount = 0;
        let createdCount = 0; // In a real app we might create users, but passwords are tricky. 
                              // For now, let's just update roles/names based on email match.

        for (const row of rows) {
            // format: ID, Name, Username, Email, Role, Verified...
            const [id, name, username, email, role] = row;
            
            if (!email) continue;

            // Try to find by ID first if present, else Email
            let user = null;
            if (id && id.length === 24) { // naive ObjectId check
                 user = await User.findById(id);
            }
            
            if (!user) {
                user = await User.findOne({ email: email.toLowerCase().trim() });
            }

            if (user) {
                // Update
                let changed = false;
                if (role && ["user", "admin", "editor", "author"].includes(role) && user.role !== role) {
                    // prevent demoting self or modifying hidden admin logic (simplified here)
                    if (user._id.toString() !== req.userId && !user.isHiddenAdmin) {
                        user.role = role;
                        changed = true;
                    }
                }
                if (name && user.name !== name) {
                    user.name = name;
                    changed = true;
                }
                
                if (changed) {
                    await user.save();
                    updatedCount++;
                }
            } else {
                // Determine if we should create users. Without password it's hard.
                // We'll skip creation for now to be safe, or generating a random password and emailing it?
                // The prompt was "connect", implying sync. Usually import updates existing.
                // Let's stick to update for now.
                console.log(`Skipping creation for ${email} (Password required)`);
            }
        }
        
        settings.lastSync = new Date();
        await settings.save();

        res.status(200).json({ message: `Import complete. Updated ${updatedCount} users.` });

    } catch (error: any) {
        console.error("Import From Sheet Error:", error);
        res.status(500).json({ message: error.message || "Internal Server Error" });
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
}
