import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import axios from "axios";
import Pronostic from "./models/Pronostic.js";

const MONGO_URI = process.env.MONGO_URI;
const API_KEY = process.env.FOOTBALL_API_KEY;

/**
 * 🔍 Debug pourquoi les matchs ne sont pas trouvés
 */
async function debugMatches() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connecté\n");

    // Récupérer UN pronostic en attente ANCIEN (au moins 2 jours)
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const pending = await Pronostic.findOne({
      sport: "Football",
      $or: [
        { statut: "en attente" },
        { statut: "en cours" }
      ],
      date: { $lt: twoDaysAgo } // Match d'il y a au moins 2 jours
    }).sort({ date: -1 });

    if (!pending) {
      console.log("❌ Aucun pronostic en attente trouvé");
      await mongoose.connection.close();
      return;
    }

    console.log("📋 Pronostic test:");
    console.log(`   Équipe 1: "${pending.equipe1}"`);
    console.log(`   Équipe 2: "${pending.equipe2}"`);
    console.log(`   Type: ${pending.type}`);
    console.log(`   Date: ${new Date(pending.date).toLocaleString('fr-FR')}`);
    console.log(`   Statut: ${pending.statut || 'vide'}\n`);

    // Récupérer les matchs de cette date
    const matchDate = new Date(pending.date).toISOString().split("T")[0];
    console.log(`🔍 Recherche dans l'API Football pour le ${matchDate}...\n`);

    const { data } = await axios.get(`https://v3.football.api-sports.io/fixtures`, {
      params: { date: matchDate },
      headers: {
        "x-rapidapi-key": API_KEY,
        "x-rapidapi-host": "v3.football.api-sports.io",
      },
    });

    const matches = data.response || [];
    console.log(`✅ ${matches.length} matchs trouvés le ${matchDate}\n`);

    if (matches.length === 0) {
      console.log("❌ Aucun match trouvé pour cette date dans l'API");
      console.log("   → Soit la date est trop ancienne, soit pas de matchs ce jour-là\n");
    } else {
      console.log("📊 Liste des matchs trouvés (10 premiers) :\n");
      matches.slice(0, 10).forEach((m, i) => {
        const home = m.teams.home.name;
        const away = m.teams.away.name;
        const score = `${m.goals.home ?? '?'}-${m.goals.away ?? '?'}`;
        const status = m.fixture.status.short;
        
        console.log(`   ${i+1}. ${home} vs ${away}`);
        console.log(`      Score: ${score} | Statut: ${status}`);
      });

      // Calculer la similarité avec notre pronostic
      console.log(`\n🔍 Recherche d'une correspondance pour "${pending.equipe1}" vs "${pending.equipe2}"...\n`);
      
      let bestMatch = null;
      let bestScore = 0;

      const normalize = (name) => name.toLowerCase().trim();

      for (const match of matches) {
        const home = normalize(match.teams.home.name);
        const away = normalize(match.teams.away.name);
        const e1 = normalize(pending.equipe1);
        const e2 = normalize(pending.equipe2);

        // Simple matching
        const score1 = (home.includes(e1.split(' ')[0]) ? 0.5 : 0) + (away.includes(e2.split(' ')[0]) ? 0.5 : 0);
        const score2 = (home.includes(e2.split(' ')[0]) ? 0.5 : 0) + (away.includes(e1.split(' ')[0]) ? 0.5 : 0);
        const score = Math.max(score1, score2);

        if (score > bestScore) {
          bestScore = score;
          bestMatch = match;
        }
      }

      if (bestMatch && bestScore > 0) {
        console.log(`✅ Meilleure correspondance trouvée (score: ${(bestScore * 100).toFixed(0)}%):`);
        console.log(`   ${bestMatch.teams.home.name} vs ${bestMatch.teams.away.name}`);
        console.log(`   Score: ${bestMatch.goals.home}-${bestMatch.goals.away}`);
        console.log(`   Statut: ${bestMatch.fixture.status.short}\n`);
        
        if (bestScore < 0.4) {
          console.log(`⚠️  Score de similarité faible (${(bestScore * 100).toFixed(0)}%)`);
          console.log(`   → Les noms ne correspondent pas assez`);
          console.log(`   → Vérifie l'orthographe des équipes dans le pronostic\n`);
        }
      } else {
        console.log(`❌ Aucune correspondance trouvée`);
        console.log(`   → Les noms "${pending.equipe1}" et "${pending.equipe2}" ne correspondent à aucun match`);
        console.log(`   → Vérifie l'orthographe ou la date du pronostic\n`);
      }
    }

    await mongoose.connection.close();
    console.log("✅ Debug terminé");

  } catch (error) {
    console.error("❌ Erreur:", error.message);
    process.exit(1);
  }
}

debugMatches();