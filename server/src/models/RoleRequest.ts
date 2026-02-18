import mongoose, { Schema, Document } from "mongoose";

export interface IRoleRequest extends Document {
  userId: mongoose.Types.ObjectId;
  currentRole: string;
  requestedRole: string;
  description: string;
  status: "pending" | "approved" | "rejected";
}

const RoleRequestSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    currentRole: {
      type: String,
      required: true,
    },
    requestedRole: {
      type: String,
      required: true,
      enum: ["admin", "editor", "author", "user"],
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IRoleRequest>("RoleRequest", RoleRequestSchema);
