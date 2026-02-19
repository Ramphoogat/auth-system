import mongoose from "mongoose";

const systemSettingsSchema = new mongoose.Schema({
  roleSystemEnabled: {
    type: Boolean,
    default: true,
  },
  governanceMode: {
    type: String,
    enum: ["MODE_1", "MODE_2", "MODE_3"],
    default: "MODE_1",
  },
  googleSheetId: {
    type: String,
    default: "",
  },
  lastSync: {
    type: Date,
  },
});

export default mongoose.model("SystemSettings", systemSettingsSchema);
