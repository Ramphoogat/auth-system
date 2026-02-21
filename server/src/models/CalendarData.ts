import mongoose, { Schema, Document } from "mongoose";

// ── Sub-schemas ────────────────────────────────────────────────────────────────

const CalendarEventSchema = new Schema(
  {
    id:          { type: String, required: true },
    start:       { type: Date,   required: true },
    end:         { type: Date,   required: true },
    title:       { type: String, required: true },
    color:       { type: String, default: "default" },
    description: { type: String },
    tags:        [{ type: String }],
    creator:     { type: String },
    createdAt:   { type: Date,   default: Date.now },
  },
  { _id: false }
);

const DateRangeSchema = new Schema(
  {
    id:    { type: String, required: true },
    start: { type: Date,   required: true },
    end:   { type: Date,   required: true },
    label: { type: String },
  },
  { _id: false }
);

// ── Main document ──────────────────────────────────────────────────────────────

export interface ICalendarData extends Document {
  userId: string;
  events: {
    id: string;
    start: Date;
    end: Date;
    title: string;
    color?: string;
    description?: string;
    tags?: string[];
    creator?: string;
    createdAt: Date;
  }[];
  ranges: {
    id: string;
    start: Date;
    end: Date;
    label?: string;
  }[];
  updatedAt: Date;
}

const CalendarDataSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    events: { type: [CalendarEventSchema], default: [] },
    ranges: { type: [DateRangeSchema],     default: [] },
  },
  { timestamps: true }
);

export default mongoose.model<ICalendarData>(
  "CalendarData",
  CalendarDataSchema,
  "calendar_data"
);
