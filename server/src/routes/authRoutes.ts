import express from 'express';
import { 
  signup, 
  login, 
  verifyOtp, 
  resendOtp, 
  forgotPassword, 
  resetPassword, 
  loginWithPhone, 
  getProfile, 
  updateProfile,
  getAdminStats,
  getAllUsers,
  getServerLogs
} from '../controllers/authController';
import { authToken, authAdmin } from '../middleware/auth';
const router = express.Router();

router.post('/signup', signup);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/login', login);
router.post('/login-with-phone', loginWithPhone);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/profile', authToken, getProfile);
router.put('/profile', authToken, updateProfile);

// Admin Routes
router.get('/admin/stats', authToken, authAdmin, getAdminStats);
router.get('/admin/users', authToken, authAdmin, getAllUsers);
router.get('/admin/logs', authToken, authAdmin, getServerLogs);

export default router;
