import mongoose, { Schema, Document } from 'mongoose';

export interface IAdmin extends Document {
  name?: string;
  username: string;
  email: string;
  countryCode?: string;
  phoneNumber?: string;
  password?: string;
  otp?: string;
  otpExpires?: Date;
  phoneOtp?: string;
  phoneOtpExpires?: Date;
  isVerified: boolean;
  isPhoneVerified: boolean;
  role: 'admin';
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}

const AdminSchema: Schema = new Schema({
  name: { type: String },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  countryCode: { type: String },
  phoneNumber: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin'], default: 'admin' },
  otp: { type: String },
  otpExpires: { type: Date },
  phoneOtp: { type: String },
  phoneOtpExpires: { type: Date },
  isVerified: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: false },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
}, { timestamps: true });

export default mongoose.model<IAdmin>('Admin', AdminSchema);
