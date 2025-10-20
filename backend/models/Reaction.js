import mongoose from "mongoose";

const reactionSchema = new mongoose.Schema({
  pronoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Pronostic",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  emoji: {
    type: String,
    required: true,
    enum: ["🔥", "💪", "⚽", "🎯", "👍", "❤️", "😍", "👑", "💰", "🚀"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Un user ne peut mettre qu'une seule réaction par prono
reactionSchema.index({ pronoId: 1, userId: 1 }, { unique: true });

export default mongoose.model("Reaction", reactionSchema);
