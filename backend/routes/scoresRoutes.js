import express from "express";
import axios from "axios";
import Pronostic from "../models/Pronostic.js";
import { findMatchScore } from "../services/flashscoreScraper.js";

const router = express.Router();

// Clé API Football
const API_KEY = process.env.FOOTBALL_API_KEY || "";
const API_BASE_URL = "https://v3.football.api-sports.io";

// Cache pour économiser les requêtes
let cache = {
  data: {},
  lastUpdate: null,
  cacheMinutes: 5, // Cache de 5 minutes
};

// 🎯 Récupérer les scores UNIQUEMENT pour les pronos actifs
router.get("/my-matches", async (req, res) => {
  try {
    console.log('🔍 Route /my-matches appelée');
    
    if (!API_KEY) {
      console.log('⚠️ API_KEY manquante');
      return res.json({ 
        success: false,
        message: "API Football non configurée - Ajoute FOOTBALL_API_KEY dans .env",
        matches: [] 
      });
    }

    console.log('✅ API_KEY présente:', API_KEY.substring(0, 10) + '...');
    const now = new Date();
    
    // Vérifier le cache
    if (cache.lastUpdate) {
      const cacheAge = (now - cache.lastUpdate) / 1000 / 60; // en minutes
      if (cacheAge < cache.cacheMinutes && Object.keys(cache.data).length > 0) {
        console.log('📦 Cache utilisé - économie de requête API');
        return res.json({ 
          success: true,
          matches: Object.values(cache.data), 
          fromCache: true 
        });
      }
    }

    // Récupérer uniquement les pronos d'aujourd'hui et en cours
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const activePronos = await Pronostic.find({
      date: { $gte: today, $lt: tomorrow },
      sport: { $regex: /football/i },
    }).select('equipe1 equipe2 date');

    console.log(`🔍 ${activePronos.length} pronos trouvés pour aujourd'hui`);

    if (activePronos.length === 0) {
      return res.json({ 
        success: true,
        matches: [], 
        message: "Aucun prono football aujourd'hui" 
      });
    }

    // Récupérer les matchs du jour depuis l'API
    const todayStr = now.toISOString().split("T")[0];
    
    console.log('📡 Appel API Football pour le', todayStr);
    
    let apiMatches = [];
    let usingAPI = false;
    
    // ESSAYER L'API D'ABORD
    if (API_KEY) {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/fixtures`, {
          params: { date: todayStr },
          headers: {
            "x-rapidapi-key": API_KEY,
            "x-rapidapi-host": "v3.football.api-sports.io",
          },
          timeout: 10000,
        });
        
        apiMatches = data.response || [];
        usingAPI = apiMatches.length > 0;
        console.log(`⚽ API Football: ${apiMatches.length} matchs reçus`);
      } catch (apiError) {
        console.log(`⚠️ API Football échouée: ${apiError.message}`);
        console.log('🕷️ Passage au scraper FlashScore...');
      }
    }

    // SI PAS DE RÉSULTATS API → UTILISER LE SCRAPER
    if (apiMatches.length === 0) {
      console.log('🕷️ Utilisation du scraper pour tous les pronos...');
      const matchedMatches = [];
      
      for (const prono of activePronos) {
        const scrapedMatch = await findMatchScore(prono.equipe1, prono.equipe2, todayStr);
        
        if (scrapedMatch) {
          const matchData = {
            id: `scraper-${prono._id}`,
            pronoId: prono._id,
            status: scrapedMatch.status,
            elapsed: scrapedMatch.elapsed,
            date: prono.date,
            league: 'N/A',
            country: 'N/A',
            homeTeam: scrapedMatch.homeTeam,
            awayTeam: scrapedMatch.awayTeam,
            homeScore: scrapedMatch.homeScore,
            awayScore: scrapedMatch.awayScore,
            homeLogo: 'https://via.placeholder.com/40',
            awayLogo: 'https://via.placeholder.com/40',
          };
          
          matchedMatches.push(matchData);
          cache.data[matchData.id] = matchData;
          console.log(`✅ Scraper: ${scrapedMatch.homeTeam} vs ${scrapedMatch.awayTeam}`);
        } else {
          console.log(`⚠️ Scraper: Match non trouvé pour ${prono.equipe1} vs ${prono.equipe2}`);
        }
        
        // Délai entre chaque scrape pour éviter rate limit
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      cache.lastUpdate = now;
      
      return res.json({
        success: true,
        matches: matchedMatches,
        fromCache: false,
        source: 'scraper'
      });
    }

    // Filtrer pour garder UNIQUEMENT les matchs de nos pronos
    const apiMatches = data.response || [];
    const matchedMatches = [];

    for (const prono of activePronos) {
      const team1 = prono.equipe1.toLowerCase().trim();
      const team2 = prono.equipe2.toLowerCase().trim();

      // Chercher le match correspondant dans l'API
      const foundMatch = apiMatches.find((m) => {
        const home = m.teams.home.name.toLowerCase();
        const away = m.teams.away.name.toLowerCase();
        
        // Correspondance exacte ou partielle
        return (
          (home.includes(team1) || team1.includes(home)) &&
          (away.includes(team2) || team2.includes(away))
        ) || (
          (away.includes(team1) || team1.includes(away)) &&
          (home.includes(team2) || team2.includes(home))
        );
      });

      if (foundMatch) {
        const matchData = {
          id: foundMatch.fixture.id,
          pronoId: prono._id,
          status: foundMatch.fixture.status.short,
          elapsed: foundMatch.fixture.status.elapsed,
          date: foundMatch.fixture.date,
          league: foundMatch.league.name,
          country: foundMatch.league.country,
          homeTeam: foundMatch.teams.home.name,
          awayTeam: foundMatch.teams.away.name,
          homeScore: foundMatch.goals.home,
          awayScore: foundMatch.goals.away,
          homeLogo: foundMatch.teams.home.logo,
          awayLogo: foundMatch.teams.away.logo,
        };

        matchedMatches.push(matchData);
        cache.data[foundMatch.fixture.id] = matchData; // Mettre en cache
      }
    }

    cache.lastUpdate = now;
    console.log(`✅ ${matchedMatches.length} matchs trouvés pour nos pronos`);

    res.json({ 
      success: true,
      matches: matchedMatches, 
      fromCache: false 
    });
    
  } catch (error) {
    console.error("❌ Erreur API Football:", error.message);
    console.error("Stack:", error.stack);
    
    // En cas d'erreur, retourner le cache si disponible
    if (Object.keys(cache.data).length > 0) {
      return res.json({ 
        success: true,
        matches: Object.values(cache.data), 
        fromCache: true,
        warning: "API temporairement indisponible - données du cache"
      });
    }
    
    res.json({ 
      success: false,
      message: error.message || "Erreur lors de la récupération des scores",
      matches: [] 
    });
  }
});

// 🔄 Forcer le rafraîchissement du cache (admin uniquement)
router.post("/refresh", async (req, res) => {
  try {
    cache.data = {};
    cache.lastUpdate = null;
    res.json({ message: "Cache réinitialisé ✅" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
