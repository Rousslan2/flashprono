import mongoose from "mongoose";

const ConnectionHistorySchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true,
      index: true 
    },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    action: { 
      type: String, 
      enum: ["login", "logout"], 
      required: true 
    },
    ipAddress: { type: String, default: null },
    userAgent: { type: String, default: null },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false }
);

// Index pour récupérer rapidement l'historique récent
ConnectionHistorySchema.index({ timestamp: -1 });
ConnectionHistorySchema.index({ userId: 1, timestamp: -1 });

export default mongoose.model("ConnectionHistory", ConnectionHistorySchema);
