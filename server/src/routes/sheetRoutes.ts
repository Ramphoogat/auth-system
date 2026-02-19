
import express from "express";
import { authToken, authAdmin } from "../middleware/auth.js";
import { connectSheet, syncToSheet, importFromSheet, getSheetStatus } from "../controllers/sheetController.js";

const router = express.Router();

router.post("/connect", authToken, authAdmin, connectSheet);
router.post("/sync/push", authToken, authAdmin, syncToSheet);
router.post("/sync/pull", authToken, authAdmin, importFromSheet);
router.get("/status", authToken, authAdmin, getSheetStatus);

export default router;
