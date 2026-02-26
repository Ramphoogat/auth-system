import mongoose, { Document, Schema } from 'mongoose';

export interface IActivityLog extends Document {
  user?: mongoose.Types.ObjectId;
  action: string;
  module: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const activityLogSchema = new Schema<IActivityLog>({
  user: { type: Schema.Types.ObjectId, ref: 'User' }, // Optional, maybe system actions don't have user
  action: { type: String, required: true },
  module: { type: String, required: true },
  description: { type: String, required: true },
}, { timestamps: true });

export const ActivityLog = mongoose.model<IActivityLog>('ActivityLog', activityLogSchema);
