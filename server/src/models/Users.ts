import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name?: string;
  email: string;
  username: string;
  password?: string;
  otp?: string;
  otpExpires?: Date;
  isVerified: boolean;
  role: "user" | "admin" | "editor" | "author";
  /** When true, this admin is hidden: other admins cannot see or change their role. Cannot be set to false once true. */
  isHiddenAdmin?: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  otpGraceExpires?: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, trim: true },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "admin", "editor", "author"],
      default: "user",
    },
    isHiddenAdmin: { type: Boolean, default: false },
    otp: { type: String },
    otpExpires: { type: Date },
    isVerified: { type: Boolean, default: false },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    otpGraceExpires: { type: Date },
  },
  { timestamps: true },
);

export default mongoose.model<IUser>("User", UserSchema, "users");
