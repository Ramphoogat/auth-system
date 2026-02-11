import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";
import Admin, { IAdmin } from "../models/Admin";
import { sendOTP, sendResetLink } from "../utils/emailService";
import { sendSMS } from "../utils/smsService";
import { AuthRequest } from "../middleware/auth";
import crypto from "crypto";


// Generate 6-digit OTP for email verification and 2FA
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();
const hashOTP = (otp: string) =>
  crypto.createHash("sha256").update(otp).digest("hex");

// Handles new user registration, hashes passwords, and sends initial verification OTP
export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, username, email, countryCode, phoneNumber, password, verificationMethod } = req.body;
    let { role } = req.body;

    // Sanitize role: explicitly allow only 'admin', everything else becomes 'user'
    // This fixes issues where 'users' (plural) might be sent by frontend
    if (role !== 'admin') {
      role = 'user';
    }

    // Auto-promote first user to admin
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
        console.log("No admins found. Promoting this user to Admin.");
        role = 'admin';
    }

    // Only set fullPhoneNumber if phoneNumber is provided and not empty
    const fullPhoneNumber = (phoneNumber && phoneNumber.trim()) 
      ? (countryCode ? `${countryCode}${phoneNumber}` : phoneNumber)
      : undefined;

    // Build the query for existing user check
    const orQuery: any[] = [{ email }, { username }];
    if (fullPhoneNumber) {
        orQuery.push({ phoneNumber: fullPhoneNumber });
    }

    // Check existing user in both collections
    const existingInUser = await User.findOne({ $or: orQuery });
    const existingInAdmin = await Admin.findOne({ $or: orQuery });
    
    const existing = existingInUser || existingInAdmin;
    
    if (existing) {
      // If the existing user is already verified (either email or phone), reject signup
      if (existing.isVerified || existing.isPhoneVerified) {
        res.status(400).json({
          message: "User with this email, username, or phone number already exists",
        });
        return;
      }
      
      // If not verified, delete the old unverified document to allow re-signup
      console.log(`Cleaning up unverified existing user: ${existing.email || existing.username}`);
      if (existingInUser) await User.deleteOne({ _id: existingInUser._id });
      if (existingInAdmin) await Admin.deleteOne({ _id: existingInAdmin._id });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); 

    const Model = role === 'admin' ? Admin : User;

    const newUser = new Model({
      name,
      username,
      email,
      countryCode,
      phoneNumber: fullPhoneNumber,
      password: hashedPassword,
      role: role,
    });

    // Set OTP based on verification method
    if (verificationMethod === 'phone') {
      newUser.phoneOtp = hashOTP(otp);
      newUser.phoneOtpExpires = otpExpires;
      newUser.isVerified = false;
      newUser.isPhoneVerified = false;
    } else {
      newUser.otp = hashOTP(otp);
      newUser.otpExpires = otpExpires;
      newUser.isVerified = false;
      newUser.isPhoneVerified = false;
    }

    await newUser.save();
    const logMsg = `New user created in database: ${newUser.email} (Role: ${newUser.role})`;
    console.log(logMsg);

    // Send OTP based on verification method
    try {
      if (verificationMethod === 'phone' && fullPhoneNumber) {
        await sendSMS(fullPhoneNumber, otp);
      } else {
        await sendOTP(email, otp);
      }
    } catch (sendError) {
      console.error('Error sending OTP, but user was created:', sendError);
      // We don't return here because the user is already saved.
      // The user can use "Resend OTP" if the initial sending failed.
    }

    res.status(201).json({
      message: "Signup successful! Please verify your account with the OTP sent.",
    });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ message: "Something went wrong", error });
  }
};

// Shared verify OTP function (used for both email verification and login 2FA)
export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, phoneNumber, otp } = req.body;
    let user: IUser | IAdmin | null = await User.findOne(email ? { email } : { phoneNumber });
    if (!user) {
      user = await Admin.findOne(email ? { email } : { phoneNumber });
    }

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Check if it's a phone OTP or email OTP
    const isPhoneVerification = !!phoneNumber;
    const savedOtp = isPhoneVerification ? user.phoneOtp : user.otp;
    const savedOtpExpires = isPhoneVerification
      ? user.phoneOtpExpires
      : user.otpExpires;
    const hashedIncomingOtp = hashOTP(otp);

    if (!savedOtp || savedOtp !== hashedIncomingOtp) {
      const failMsg = `Invalid OTP attempt for ${email || phoneNumber}`;
      console.warn(failMsg);
      res.status(400).json({ message: "Invalid OTP" });
      return;
    }

    if (!savedOtpExpires || savedOtpExpires < new Date()) {
      res.status(400).json({ message: "OTP expired" });
      return;
    }

    // Manage User status: Mark user as verified and clear OTP fields after successful verification
    if (isPhoneVerification) {
      user.isPhoneVerified = true;
      user.phoneOtp = undefined;
      user.phoneOtpExpires = undefined;
    } else {
      user.isVerified = true;
      user.otp = undefined;
      user.otpExpires = undefined;
    }

    await user.save();

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in .env");
    }

    // Generating JWT tokens for authentication: Sign a new token for the session
    const token = jwt.sign(
      { email: user.email, phoneNumber: user.phoneNumber, id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    const successMsg = `Authentication successful for ${user.email || user.phoneNumber}`;
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
    const { identifier, password } = req.body; // identifier can be email or username

    if (!identifier || !password) {
      res.status(400).json({ message: "Identifier and password are required" });
      return;
    }

    // Find user by email OR username in both collections
    let user: IUser | IAdmin | null = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });
    if (!user) {
      user = await Admin.findOne({
        $or: [{ email: identifier }, { username: identifier }],
      });
    }

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

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

    // Self-heal: Fix invalid role if it exists in DB (e.g. 'users' -> 'user')
    // This prevents validation errors when saving the user with an OTP
    if ((user as any).role === 'users') {
        user.role = 'user';
    }

    await user.save();
    const otpMsg = `2FA OTP sent to ${user.email} (Category: ${user.role})`;
    console.log(otpMsg);

    await sendOTP(user.email, otp);

    // Return success but NO token yet. The client must verify OTP.
    res.status(200).json({
      message: "Credentials valid. OTP sent to your email.",
      email: user.email,
      requiresOtp: true,
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: "Something went wrong", error });
  }
};

// Generates and sends a new OTP if the previous one expired or was not received
export const resendOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, phoneNumber } = req.body;
    let user: IUser | IAdmin | null = await User.findOne(email ? { email } : { phoneNumber });
    if (!user) {
      user = await Admin.findOne(email ? { email } : { phoneNumber });
    }

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const otp = generateOTP();

    if (phoneNumber) {
      user.phoneOtp = hashOTP(otp);
      user.phoneOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
      await user.save();
      await sendSMS(phoneNumber, otp);
    } else {
      user.otp = hashOTP(otp);
      user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
      await user.save();
      await sendOTP(user.email, otp);
    }

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
    let user: IUser | IAdmin | null = await User.findOne({ email });
    if (!user) {
      user = await Admin.findOne({ email });
    }

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

    let user: IUser | IAdmin | null = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: new Date() },
    });
    if (!user) {
      user = await Admin.findOne({
        resetPasswordToken: resetTokenHash,
        resetPasswordExpires: { $gt: new Date() },
      });
    }

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

    let user: IUser | IAdmin | null = await User.findById(req.userId).select(
      "-password -otp -phoneOtp -resetPasswordToken -resetPasswordExpires",
    );
    if (!user) {
      user = await Admin.findById(req.userId).select(
        "-password -otp -phoneOtp -resetPasswordToken -resetPasswordExpires",
      );
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

    const {
      name,
      username,
      email,
      countryCode,
      phoneNumber,
      currentPassword,
      newPassword,
    } = req.body as {
      name?: string;
      username?: string;
      email?: string;
      countryCode?: string;
      phoneNumber?: string;
      currentPassword?: string;
      newPassword?: string;
    };

    let user: IUser | IAdmin | null = await User.findById(req.userId);
    if (!user) {
      user = await Admin.findById(req.userId);
    }
    
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (typeof name === "string") {
      user.name = name.trim();
    }

    if (username && username !== user.username) {
      const existingUsernameInUser = await User.findOne({
        username,
        _id: { $ne: req.userId },
      });
      const existingUsernameInAdmin = await Admin.findOne({
        username,
        _id: { $ne: req.userId },
      });
      if (existingUsernameInUser || existingUsernameInAdmin) {
        res.status(400).json({ message: "Username is already in use" });
        return;
      }
      user.username = username;
    }

    if (email && email !== user.email) {
      const existingEmailInUser = await User.findOne({ email, _id: { $ne: req.userId } });
      const existingEmailInAdmin = await Admin.findOne({ email, _id: { $ne: req.userId } });
      if (existingEmailInUser || existingEmailInAdmin) {
        res.status(400).json({ message: "Email is already in use" });
        return;
      }
      user.email = email;
      user.isVerified = false;
    }

    const normalizedCountryCode = countryCode ?? user.countryCode ?? "";
    if (phoneNumber) {
      const fullPhoneNumber = `${normalizedCountryCode}${phoneNumber}`;
      if (fullPhoneNumber !== user.phoneNumber) {
        const existingPhoneInUser = await User.findOne({
          phoneNumber: fullPhoneNumber,
          _id: { $ne: req.userId },
        });
        const existingPhoneInAdmin = await Admin.findOne({
          phoneNumber: fullPhoneNumber,
          _id: { $ne: req.userId },
        });
        if (existingPhoneInUser || existingPhoneInAdmin) {
          res.status(400).json({ message: "Phone number is already in use" });
          return;
        }
        user.phoneNumber = fullPhoneNumber;
        user.countryCode = normalizedCountryCode;
        user.isPhoneVerified = false;
      }
    } else if (countryCode) {
      user.countryCode = countryCode;
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
      "-password -otp -phoneOtp -resetPasswordToken -resetPasswordExpires",
    );

    res.status(200).json({ message: "Profile updated successfully", user: safeUser });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
};

// Login with Phone OTP
export const loginWithPhone = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { countryCode, phoneNumber } = req.body;
    const fullPhoneNumber = `${countryCode}${phoneNumber}`;

    let user: IUser | IAdmin | null = await User.findOne({ phoneNumber: fullPhoneNumber });
    if (!user) {
      user = await Admin.findOne({ phoneNumber: fullPhoneNumber });
    }
    if (!user) {
      res
        .status(404)
        .json({ message: "User with this phone number not found" });
      return;
    }

    const otp = generateOTP();
    user.phoneOtp = hashOTP(otp);
    user.phoneOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    await user.save();

    await sendSMS(fullPhoneNumber, otp);

    res.status(200).json({
      message: "OTP sent to your phone number",
      phoneNumber: user.phoneNumber,
      requiresOtp: true,
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
};



export const getAdminStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAdmins = await Admin.countDocuments();
    res.status(200).json({
      totalUsers: totalUsers + totalAdmins,
      activeUsers: Math.floor((totalUsers + totalAdmins) * 0.1) + 1,
      securityAlerts: 0,
      systemUptime: '99.9%'
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch stats", error });
  }
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    const admins = await Admin.find({}, '-password').sort({ createdAt: -1 });
    
    // Combine and sort by creation date
    const allUsers = [...users, ...admins].sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    res.status(200).json({ users: allUsers });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users", error });
  }
};

export const getServerLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    res.status(200).json({ logs: [] });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch logs", error });
  }
};
