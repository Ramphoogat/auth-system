import express from "express";
import {
  signup,
  login,
  verifyOtp,
  resendOtp,
  logout,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  getAdminStats,
  getAllUsers,
  getOverview,
  getServerLogs,
  updateUserRole,
  createUser,
  createRoleRequest,
  getRoleRequests,
  approveRoleRequest,
  rejectRoleRequest,
  deleteUser,
} from "../controllers/authController.js";
import {
  googleAuth,
  googleCallback,
  githubAuth,
  githubCallback,
} from "../controllers/socialAuthController.js";
import {
  authToken,
  authAdmin,
  authAuthor,
  authEditor,
} from "../middleware/auth.js";
const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    message: "Auth API is running",
    endpoints: [
      "POST /signup",
      "POST /login",
      "POST /verify-otp",
      "POST /resend-otp",
      "POST /logout",
      "POST /forgot-password",
      "POST /reset-password/:token",
      "GET /profile",
      "GET /google",
      "GET /github",
    ],
  });
});

router.post("/signup", signup);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/profile", authToken, getProfile);
router.put("/profile", authToken, updateProfile);

// Social Login Routes
router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);
router.get("/github", githubAuth);
router.get("/github/callback", githubCallback);

// Admin Routes (Hierarchical Access)
router.get("/admin/stats", authToken, authAuthor, getAdminStats); // Admin & Author
router.get("/admin/users", authToken, authEditor, getAllUsers); // Admin, Author & Editor
router.post("/admin/users", authToken, authEditor, createUser); // Admin, Author & Editor - Create User with Role
// Overview endpoint: accessible to any authenticated user, returns deduplicated totals and a small user sample
router.get("/overview", authToken, getOverview);
router.get("/admin/logs", authToken, authAdmin, getServerLogs); // Admin Only
router.put("/admin/users/:userId/role", authToken, authEditor, updateUserRole); // Admin, Author, Editor - Role Management (Restricted in controller)
router.delete("/admin/users/:id", authToken, authAdmin, deleteUser); // Admin Only - Delete User

// Role Requests
router.post("/role-requests", authToken, createRoleRequest);
// View Requests: Editors and above (Editor, Author, Admin)
router.get("/role-requests", authToken, authEditor, getRoleRequests);
// Approve/Reject: Editors and above
router.put("/role-requests/:id/approve", authToken, authEditor, approveRoleRequest);
router.put("/role-requests/:id/reject", authToken, authEditor, rejectRoleRequest);

// Publicly accessible users list (Authenticated)
router.get("/users", authToken, getAllUsers);

export default router;
