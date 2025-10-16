import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connecté");
  } catch (error) {
    console.error("Erreur connexion MongoDB:", error.message);
    process.exit(1);
  }
};
