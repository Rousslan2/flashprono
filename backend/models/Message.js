import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userIsAdmin: {
      type: Boolean,
      default: false,
    },
    message: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

// Index pour récupérer les messages récents rapidement
MessageSchema.index({ timestamp: -1 });

export default mongoose.model("Message", MessageSchema);
