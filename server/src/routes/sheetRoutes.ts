
import express from "express";
import { authToken, authAdmin } from "../middleware/auth.js";

import { connectSheet, syncToSheet, getSheetStatus } from "../controllers/sheetController.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    message: "Sheets API is running",
    endpoints: [
      "POST /connect",
      "POST /sync/push",
      "GET /status",
    ],
  });
});

router.post("/connect", authToken, authAdmin, connectSheet);
router.post("/sync/push", authToken, authAdmin, syncToSheet);
router.get("/status", authToken, authAdmin, getSheetStatus);

export default router;
