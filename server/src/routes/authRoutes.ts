import express from "express";
import {
  signup,
  login,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  getAdminStats,
  getAllUsers,
  getOverview,
  getServerLogs,
  updateUserRole,
} from "../controllers/authController.js";
import {
  authToken,
  authAdmin,
  authAuthor,
  authEditor,
} from "../middleware/auth.js";
const router = express.Router();

router.post("/signup", signup);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/profile", authToken, getProfile);
router.put("/profile", authToken, updateProfile);

// Admin Routes (Hierarchical Access)
router.get("/admin/stats", authToken, authAuthor, getAdminStats); // Admin & Author
router.get("/admin/users", authToken, authEditor, getAllUsers); // Admin, Author & Editor
// Overview endpoint: accessible to any authenticated user, returns deduplicated totals and a small user sample
router.get("/overview", authToken, getOverview);
router.get("/admin/logs", authToken, authAdmin, getServerLogs); // Admin Only
router.put("/admin/users/:userId/role", authToken, authEditor, updateUserRole); // Admin, Author, Editor - Role Management (Restricted in controller)

// Publicly accessible users list (Authenticated)
router.get("/users", authToken, getAllUsers);

export default router;
