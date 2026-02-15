import { Request, Response } from "express";
import SystemSettings from "../models/SystemSettings.js";
import { AuthRequest } from "../middleware/auth.js";

// Ensure settings exist (helper)
const ensureSettings = async () => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      console.log("Creating default SystemSettings...");
      settings = await SystemSettings.create({
        roleSystemEnabled: true,
        governanceMode: "MODE_1",
      });
    }
    return settings;
  } catch (err) {
    console.error("Error in ensureSettings:", err);
    throw err;
  }
};

export const getSettings = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const settings = await ensureSettings();
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch system settings", error });
  }
};

export const toggleRoleSystem = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { enabled } = req.body;
    
    if (typeof enabled !== "boolean") {
      res.status(400).json({ message: "Invalid value. 'enabled' must be boolean" });
      return;
    }

    const settings = await ensureSettings();
    settings.roleSystemEnabled = enabled;
    await settings.save();

    res.status(200).json({ 
      message: `Role system ${enabled ? "enabled" : "disabled"}`, 
      settings 
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update role system status", error });
  }
};

export const changeGovernanceMode = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    console.log("Receiving mode update request:", req.body);
    const { mode } = req.body;

    const validModes = ["MODE_1", "MODE_2", "MODE_3"];
    if (!validModes.includes(mode)) {
      res.status(400).json({ message: "Invalid governance mode" });
      return;
    }

    const settings = await ensureSettings();
    settings.governanceMode = mode;
    await settings.save();

    res.status(200).json({ 
      message: `Governance mode updated to ${mode}`, 
      settings 
    });

  } catch (error) {
    console.error("Error in changeGovernanceMode:", error);
    res.status(500).json({ message: "Failed to update governance mode", error });
  }
};
