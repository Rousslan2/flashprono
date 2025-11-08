import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Pronostic from "./models/Pronostic.js";

const MONGO_URI = process.env.MONGO_URI;

/**
 * 🧹 Nettoie les pronostics trop anciens qui restent en attente
 * L'API Football ne garde que ~30 jours de données
 */
async function cleanOldPending() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connecté\n");

    // Date limite : 30 jours en arrière
    const limitDate = new Date();
    limitDate.setDate(limitDate.getDate() - 30);

    console.log(`📅 Date limite: ${limitDate.toLocaleDateString('fr-FR')}`);
    console.log(`   (Les matchs avant cette date ne sont plus dans l'API)\n`);

    // Trouver les pronostics en attente/en cours qui sont trop anciens
    const oldPending = await Pronostic.find({
      sport: "Football",
      $or: [
        { statut: "en attente" },
        { statut: "en cours" },
        { statut: { $exists: false } },
        { statut: "" }
      ],
      date: { $lt: limitDate }
    });

    console.log(`📊 ${oldPending.length} pronostics trop anciens trouvés\n`);

    if (oldPending.length === 0) {
      console.log("✅ Aucun pronostic ancien à nettoyer");
      await mongoose.connection.close();
      return;
    }

    // Afficher les détails
    console.log("📋 Pronostics qui seront marqués comme 'expiré' :\n");
    oldPending.forEach((p, i) => {
      const matchDate = new Date(p.date).toLocaleDateString('fr-FR');
      console.log(`   ${i+1}. ${p.equipe1} vs ${p.equipe2}`);
      console.log(`      Date: ${matchDate} | Type: ${p.type} | Statut: ${p.statut || 'vide'}`);
    });

    console.log("\n─".repeat(40));
    console.log("⚠️  ACTION: Marquer ces pronostics comme 'perdu' (match non trouvé) ?");
    console.log("─".repeat(40));
    console.log("\nOu bien, nous pouvons simplement les afficher pour que tu décides manuellement.");
    console.log("Pour l'instant, aucune modification n'est faite.\n");

    // Décommenter les lignes ci-dessous pour activer la mise à jour automatique
    /*
    const result = await Pronostic.updateMany(
      {
        _id: { $in: oldPending.map(p => p._id) }
      },
      {
        $set: {
          statut: "perdu",
          resultat: "perdu",
          scoreLive: "Match expiré (non trouvé dans l'API)",
          dateValidation: new Date()
        }
      }
    );

    console.log(`✅ ${result.modifiedCount} pronostics mis à jour`);
    */

    await mongoose.connection.close();
    console.log("\n✅ Script terminé");

  } catch (error) {
    console.error("❌ Erreur:", error);
    process.exit(1);
  }
}

cleanOldPending();