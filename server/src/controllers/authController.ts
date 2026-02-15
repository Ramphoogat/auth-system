import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/Users.js";
import { sendOTP, sendResetLink } from "../utils/emailService.js";
import { AuthRequest } from "../middleware/auth.js";
import crypto from "crypto";

// Generate 6-digit OTP for email verification and 2FA
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();
const hashOTP = (otp: string) =>
  crypto.createHash("sha256").update(otp).digest("hex");

// Handles new user registration, hashes passwords, and sends initial verification OTP
export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, username, email, password } = req.body;
    // IGNORE role from frontend - all new signups are 'user'
    let role = "user";

    // Auto-promote first user to admin and mark as hidden admin (cannot be seen or modified by other admins)
    const userCount = await User.countDocuments();
    let isHiddenAdmin = false;
    if (userCount === 0) {
      console.log("No users found. Promoting this user to Admin (hidden).");
      role = "admin";
      isHiddenAdmin = true;
    }

    // Sanitize inputs
    const sanitizedEmail = email ? email.toLowerCase().trim() : "";
    const sanitizedUsername = username ? username.trim() : "";

    // Use sanitized values
    const queryEmail = sanitizedEmail;
    const queryUsername = sanitizedUsername;

    // Check if username already exists
    const existingUsername = await User.findOne({ username: queryUsername });

    if (existingUsername && existingUsername.isVerified) {
      res.status(400).json({
        message: "Username already taken",
      });
      return;
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email: queryEmail });

    if (existingEmail) {
      // If the existing email is already verified, reject signup
      if (existingEmail.isVerified) {
        res.status(400).json({
          message: `You already have a verified account with this email`,
        });
        return;
      }

      // If not verified, delete the old unverified document to allow re-signup
      console.log(`Cleaning up unverified profile: ${existingEmail.email}`);
      await User.deleteOne({ _id: existingEmail._id });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const newUser = new User({
      name,
      username: queryUsername,
      email: queryEmail,
      password: hashedPassword,
      role: role,
      ...(isHiddenAdmin && { isHiddenAdmin: true }),
    });

    newUser.otp = hashOTP(otp);
    newUser.otpExpires = otpExpires;
    newUser.isVerified = false;

    await newUser.save();
    const logMsg = `New user created in database: ${newUser.email} (Role: ${newUser.role})`;
    console.log(logMsg);

    // Send OTP
    try {
      await sendOTP(queryEmail, otp);
    } catch (sendError) {
      console.error("Error sending OTP, but user was created:", sendError);
      // We don't return here because the user is already saved.
      // The user can use "Resend OTP" if the initial sending failed.
    }

    res.status(201).json({
      message:
        "Signup successful! Please verify your account with the OTP sent.",
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Something went wrong", error });
  }
};

// Shared verify OTP function (used for both email verification and login 2FA)
export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ message: `No user profile found for this email` });
      return;
    }

    // Check if it's a valid OTP
    const savedOtp = user.otp;
    const savedOtpExpires = user.otpExpires;
    const hashedIncomingOtp = hashOTP(otp);

    if (!savedOtp || savedOtp !== hashedIncomingOtp) {
      const failMsg = `Invalid OTP attempt for ${email}`;
      console.warn(failMsg);
      res.status(400).json({ message: "Invalid OTP" });
      return;
    }

    if (!savedOtpExpires || savedOtpExpires < new Date()) {
      res.status(400).json({ message: "OTP expired" });
      return;
    }

    // Manage User status: Mark user as verified and clear OTP fields after successful verification
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in .env");
    }

    // Generating JWT tokens for authentication: Sign a new token for the session
    const token = jwt.sign(
      { email: user.email, id: user._id.toString(), role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" },
    );

    const successMsg = `Authentication successful for ${user.email}`;
    console.log(successMsg);

    res
      .status(200)
      .json({ message: "Authentication successful", result: user, token });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
};

// Validates user credentials and triggers the Two-Factor Authentication (2FA) process by sending an OTP
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    let { identifier, password } = req.body; // identifier can be email or username

    if (!identifier || !password) {
      res.status(400).json({ message: "Identifier and password are required" });
      return;
    }

    identifier = identifier.trim();
    // Check if identifier looks like an email (has @), if so, lowercase it
    if (identifier.includes("@")) {
      identifier = identifier.toLowerCase();
    }

    // Find user by identifier (email or username)
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Verify password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password as string,
    );
    if (!isPasswordCorrect) {
      const failMsg = `Failed login attempt (password incorrect) for: ${identifier}`;
      console.warn(failMsg);
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    // Generate and Send OTP (2FA)
    const otp = generateOTP();
    user.otp = hashOTP(otp); // Store hashed OTP for security
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await user.save();
    const otpMsg = `2FA OTP sent to ${user.email} (Role: ${user.role})`;
    console.log(otpMsg);

    await sendOTP(user.email, otp);

    // Return success but NO token yet. The client must verify OTP.
    res.status(200).json({
      message: "Credentials valid. OTP sent to your email.",
      email: user.email,
      currentRole: user.role,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Something went wrong", error });
  }
};

// Generates and sends a new OTP if the previous one expired or was not received
export const resendOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const otp = generateOTP();

    user.otp = hashOTP(otp);
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    await user.save();
    await sendOTP(user.email, otp);

    res.status(200).json({ message: "OTP resent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
};

// Initiates the password recovery process by generating a secure reset token and emailing a link to the user
export const forgotPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await user.save();

    // Create reset URL (assuming frontend runs on localhost:5173 or similar, need to configure this properly)
    // In production, use process.env.CLIENT_URL
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

    await sendResetLink(user.email, resetUrl);

    res.status(200).json({ message: "Password reset link sent to email" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
};

// Validates the reset token and updates the user's password with a new hashed version
export const resetPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (typeof token !== "string") {
      res.status(400).json({ message: "Invalid token format" });
      return;
    }

    const resetTokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      res.status(400).json({ message: "Invalid or expired token" });
      return;
    }

    user.password = await bcrypt.hash(password, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
};

export const getProfile = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const user = await User.findById(req.userId);
    const safeUser = user ? user.toObject() : null;
    if (safeUser) {
      delete safeUser.password;
      delete safeUser.otp;
      delete safeUser.resetPasswordToken;
      delete safeUser.resetPasswordExpires;
    }

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const { name, username, email, currentPassword, newPassword } =
      req.body as {
        name?: string;
        username?: string;
        email?: string;
        currentPassword?: string;
        newPassword?: string;
      };

    const user = await User.findById(req.userId);

    // Check duplication
    const checkUsername = async (u: string) => {
      return await User.findOne({ username: u, _id: { $ne: req.userId } });
    };

    const checkEmail = async (e: string) => {
      return await User.findOne({ email: e, _id: { $ne: req.userId } });
    };

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (typeof name === "string") {
      user.name = name.trim();
    }

    if (username && username !== user.username) {
      if (await checkUsername(username)) {
        res.status(400).json({ message: "Username is already in use" });
        return;
      }
      user.username = username;
    }

    if (email && email !== user.email) {
      if (await checkEmail(email)) {
        res.status(400).json({ message: "Email is already in use" });
        return;
      }
      user.email = email;
      user.isVerified = false;
    }

    if (newPassword) {
      if (!currentPassword) {
        res.status(400).json({ message: "Current password is required" });
        return;
      }

      const isPasswordCorrect = await bcrypt.compare(
        currentPassword,
        user.password as string,
      );
      if (!isPasswordCorrect) {
        res.status(400).json({ message: "Current password is incorrect" });
        return;
      }

      user.password = await bcrypt.hash(newPassword, 12);
    }

    await user.save();

    const safeUser = await User.findById(req.userId).select(
      "-password -otp -resetPasswordToken -resetPasswordExpires",
    );

    res
      .status(200)
      .json({ message: "Profile updated successfully", user: safeUser });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
};

export const getAdminStats = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments();
    
    res.status(200).json({
      totalUsers,
      activeUsers: Math.floor(totalUsers * 0.1) + 1, // Mock logic from original code
      securityAlerts: 0,
      systemUptime: "99.9%",
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch stats", error });
  }
};

// Overview endpoint for any authenticated user. Returns unique totals and a small sample of users.
export const getOverview = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const users = await User.find(
      {},
      "email username name role isVerified createdAt",
    ).sort({ createdAt: -1 }).lean();

    // Return a small sample (first 2) to show on overview cards, and the total unique count
    const sample = users.slice(0, 2).map((u: any) => ({
      _id: u._id,
      name: u.name || u.username,
      username: u.username,
      email: u.email,
      role: u.role,
      isVerified: u.isVerified,
      createdAt: u.createdAt,
    }));

    res.status(200).json({
      totalUsers: users.length,
      activeUsers: Math.floor(users.length * 0.1) + 1,
      securityAlerts: 0,
      systemUptime: "99.9%",
      users: sample,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch overview", error });
  }
};

export const getAllUsers = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    let users = await User.find({}, "-password").sort({ createdAt: -1 });

    // Non-hidden admins must not see hidden admins (they cannot see or change them)
    if (req.userId && req.userRole === "admin") {
      const requester = await User.findById(req.userId).select(
        "isHiddenAdmin createdAt",
      );
      const oldestAdmin = await User.findOne(
        { role: "admin" },
        "_id",
        { sort: { createdAt: 1 } },
      );
      const isRequesterHiddenAdmin =
        requester &&
        (!!(requester as IUser).isHiddenAdmin ||
          (oldestAdmin &&
            String(requester._id) === String(oldestAdmin._id)));
      if (requester && !isRequesterHiddenAdmin && oldestAdmin) {
        const hiddenAdminId = String(oldestAdmin._id);
        users = users.filter((u) => {
          if (u.role !== "admin") return true;
          const isHidden =
            (u as IUser).isHiddenAdmin ||
            String(u._id) === hiddenAdminId;
          return !isHidden;
        });
      }
    }

    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users", error });
  }
};

export const getServerLogs = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    res.status(200).json({ logs: [] });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch logs", error });
  }
};

// Admin-only role management
// Update updateUserRole to use roleDelegation logic
import { canManageRole, Role } from "../utils/roleDelegation.js";
import SystemSettings from "../models/SystemSettings.js";

export const updateUserRole = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { userId } = req.params;
    const { role: newRole } = req.body;

    if (!req.userRole || !req.userId) {
      res.status(403).json({ message: "Unauthorized" });
      return;
    }

    // Validate request role string
    const validRoles = ["user", "author", "editor", "admin"];
    if (!validRoles.includes(newRole)) {
      res.status(400).json({
        message: "Invalid role. Must be one of: user, author, editor, admin",
      });
      return;
    }

    const userDoc = await User.findById(userId);
    if (!userDoc) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const requester = await User.findById(req.userId).select(
      "isHiddenAdmin role createdAt",
    );
    if (!requester) {
      res.status(403).json({ message: "Unauthorized" });
      return;
    }

    // Hidden admin: explicit flag or (backwards compat) oldest admin by createdAt
    const oldestAdmin = await User.findOne(
      { role: "admin" },
      "_id",
      { sort: { createdAt: 1 } },
    );
    const isRequesterHiddenAdmin =
      !!(requester as IUser).isHiddenAdmin ||
      (requester.role === "admin" &&
        oldestAdmin &&
        String(requester._id) === String(oldestAdmin._id));
    const isTargetHiddenAdmin =
      !!(userDoc as IUser).isHiddenAdmin ||
      (userDoc.role === "admin" &&
        oldestAdmin &&
        String(userDoc._id) === String(oldestAdmin._id));

    // Other admins cannot change the hidden admin's role. Only the hidden admin (self) or another hidden admin may.
    if (isTargetHiddenAdmin) {
      const isSelf = String(req.userId) === String(userId);
      if (!isSelf && !isRequesterHiddenAdmin) {
        res.status(403).json({
          message: "Access denied. You cannot modify this admin account.",
        });
        return;
      }
    }

    // Fetch governance settings
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({
        roleSystemEnabled: true,
        governanceMode: "MODE_1",
      });
    }

    if (!settings.roleSystemEnabled) {
      res.status(403).json({
        message: "Role system disabled by admin settings",
      });
      return;
    }

    const oldRole = userDoc.role;

    // Hidden admin can assign any role to non-hidden users (including admin), regardless of governance mode. Other admins follow the matrix.
    const allowedByMatrix = await canManageRole(
      req.userRole as Role,
      newRole as Role,
    );
    const hiddenAdminAssigningAnyRole =
      isRequesterHiddenAdmin && !isTargetHiddenAdmin;
    if (!allowedByMatrix && !hiddenAdminAssigningAnyRole) {
      res.status(403).json({
        message: "You are not allowed to assign this role",
      });
      return;
    }

    const canManageExisting = await canManageRole(
      req.userRole as Role,
      oldRole as Role,
    );
    const hiddenAdminModifyingNonHidden =
      isRequesterHiddenAdmin && !isTargetHiddenAdmin;
    if (!canManageExisting && !hiddenAdminModifyingNonHidden) {
      res.status(403).json({
        message: "You are not allowed to modify this user",
      });
      return;
    }

    if (
      oldRole === "admin" &&
      req.userRole !== "admin" &&
      !isRequesterHiddenAdmin
    ) {
      res.status(403).json({
        message: "Access denied. You cannot modify an Admin account.",
      });
      return;
    }

    if (oldRole === newRole) {
      res.status(200).json({
        message: "Role is already " + newRole,
        user: userDoc,
      });
      return;
    }

    userDoc.role = newRole;
    await userDoc.save();

    res.status(200).json({ message: "Role updated successfully", user: userDoc });
  } catch (error) {
    res.status(500).json({ message: "Failed to update role", error });
  }
};
