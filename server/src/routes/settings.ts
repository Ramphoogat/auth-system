import express from "express";
import { authToken, authAdmin } from "../middleware/auth.js";
import { 
  getSettings, 
  toggleRoleSystem, 
  changeGovernanceMode 
} from "../controllers/settingsController.js";

const router = express.Router();

// Apply auth middleware to all routes
// settings are admin only
router.use(authToken); 

router.get("/", getSettings);

// Update routes are admin only
router.use(authAdmin);
router.patch("/toggle", toggleRoleSystem);
router.patch("/mode", changeGovernanceMode);

export default router;
