import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name?: string;
  username: string; // username field
  email: string;
  countryCode?: string;
  phoneNumber?: string; // full phone number (country code + number)
  password?: string;
  otp?: string; // email otp field
  otpExpires?: Date; // email otp expiry field
  phoneOtp?: string; // phone otp field
  phoneOtpExpires?: Date; // phone otp expiry field
  isVerified: boolean; // email verification field
  isPhoneVerified: boolean; // phone verification field
  role:'user';
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}

// Helper to check if OTP is valid
export interface IUserMethods {
    verifyOTP(inputOtp: string): boolean;
}

const UserSchema: Schema = new Schema({
  name: { type: String },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  countryCode: { type: String },
  phoneNumber: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user'], default: 'user' },
  otp: { type: String },
  otpExpires: { type: Date },
  phoneOtp: { type: String },
  phoneOtpExpires: { type: Date },
  isVerified: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: false },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
