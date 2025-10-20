import express from "express";
import axios from "axios";
import Pronostic from "../models/Pronostic.js";

const router = express.Router();

// Clé API Football (à mettre dans .env)
const API_KEY = process.env.FOOTBALL_API_KEY || "";
const API_BASE_URL = "https://v3.football.api-sports.io";

// 📊 Récupérer les scores en direct
router.get("/live", async (req, res) => {
  try {
    if (!API_KEY) {
      return res.status(500).json({ 
        message: "API Football non configurée",
        matches: [] 
      });
    }

    const { data } = await axios.get(`${API_BASE_URL}/fixtures`, {
      params: {
        live: "all", // Tous les matchs en direct
      },
      headers: {
        "x-rapidapi-key": API_KEY,
        "x-rapidapi-host": "v3.football.api-sports.io",
      },
    });

    // Formater les données
    const matches = (data.response || []).map((match) => ({
      id: match.fixture.id,
      status: match.fixture.status.short,
      elapsed: match.fixture.status.elapsed,
      league: match.league.name,
      country: match.league.country,
      homeTeam: match.teams.home.name,
      awayTeam: match.teams.away.name,
      homeScore: match.goals.home,
      awayScore: match.goals.away,
      homeLogo: match.teams.home.logo,
      awayLogo: match.teams.away.logo,
    }));

    res.json({ matches });
  } catch (error) {
    console.error("❌ Erreur API Football:", error.message);
    res.status(500).json({ 
      message: "Erreur récupération scores",
      matches: [] 
    });
  }
});

// 📅 Récupérer les matchs du jour
router.get("/today", async (req, res) => {
  try {
    if (!API_KEY) {
      return res.status(500).json({ 
        message: "API Football non configurée",
        matches: [] 
      });
    }

    const today = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD

    const { data } = await axios.get(`${API_BASE_URL}/fixtures`, {
      params: {
        date: today,
      },
      headers: {
        "x-rapidapi-key": API_KEY,
        "x-rapidapi-host": "v3.football.api-sports.io",
      },
    });

    // Formater les données
    const matches = (data.response || []).slice(0, 50).map((match) => ({
      id: match.fixture.id,
      status: match.fixture.status.short,
      elapsed: match.fixture.status.elapsed,
      date: match.fixture.date,
      league: match.league.name,
      country: match.league.country,
      homeTeam: match.teams.home.name,
      awayTeam: match.teams.away.name,
      homeScore: match.goals.home,
      awayScore: match.goals.away,
      homeLogo: match.teams.home.logo,
      awayLogo: match.teams.away.logo,
    }));

    res.json({ matches });
  } catch (error) {
    console.error("❌ Erreur API Football:", error.message);
    res.status(500).json({ 
      message: "Erreur récupération scores",
      matches: [] 
    });
  }
});

// 📅 Récupérer les matchs de demain
router.get("/tomorrow", async (req, res) => {
  try {
    if (!API_KEY) {
      return res.status(500).json({ 
        message: "API Football non configurée",
        matches: [] 
      });
    }

    // Date de demain
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDate = tomorrow.toISOString().split("T")[0];

    const { data } = await axios.get(`${API_BASE_URL}/fixtures`, {
      params: {
        date: tomorrowDate,
      },
      headers: {
        "x-rapidapi-key": API_KEY,
        "x-rapidapi-host": "v3.football.api-sports.io",
      },
    });

    // Formater les données
    const matches = (data.response || []).slice(0, 50).map((match) => ({
      id: match.fixture.id,
      status: match.fixture.status.short,
      elapsed: match.fixture.status.elapsed,
      date: match.fixture.date,
      league: match.league.name,
      country: match.league.country,
      homeTeam: match.teams.home.name,
      awayTeam: match.teams.away.name,
      homeScore: match.goals.home,
      awayScore: match.goals.away,
      homeLogo: match.teams.home.logo,
      awayLogo: match.teams.away.logo,
    }));

    res.json({ matches });
  } catch (error) {
    console.error("❌ Erreur API Football:", error.message);
    res.status(500).json({ 
      message: "Erreur récupération scores",
      matches: [] 
    });
  }
});

// 📅 Récupérer les matchs par date personnalisée
router.get("/by-date/:date", async (req, res) => {
  try {
    if (!API_KEY) {
      return res.status(500).json({ 
        message: "API Football non configurée",
        matches: [] 
      });
    }

    const { date } = req.params; // Format attendu: YYYY-MM-DD

    const { data } = await axios.get(`${API_BASE_URL}/fixtures`, {
      params: {
        date: date,
      },
      headers: {
        "x-rapidapi-key": API_KEY,
        "x-rapidapi-host": "v3.football.api-sports.io",
      },
    });

    // Formater les données
    const matches = (data.response || []).slice(0, 50).map((match) => ({
      id: match.fixture.id,
      status: match.fixture.status.short,
      elapsed: match.fixture.status.elapsed,
      date: match.fixture.date,
      league: match.league.name,
      country: match.league.country,
      homeTeam: match.teams.home.name,
      awayTeam: match.teams.away.name,
      homeScore: match.goals.home,
      awayScore: match.goals.away,
      homeLogo: match.teams.home.logo,
      awayLogo: match.teams.away.logo,
    }));

    res.json({ matches });
  } catch (error) {
    console.error("❌ Erreur API Football:", error.message);
    res.status(500).json({ 
      message: "Erreur récupération scores",
      matches: [] 
    });
  }
});

// 🧪 Test de l'API Football (pour vérifier que la clé fonctionne)
router.get("/test", async (req, res) => {
  try {
    if (!API_KEY) {
      return res.status(500).json({ 
        success: false,
        message: "❌ Clé API Football non configurée dans .env"
      });
    }

    // Test avec l'endpoint status de l'API
    const { data } = await axios.get(`${API_BASE_URL}/status`, {
      headers: {
        "x-rapidapi-key": API_KEY,
        "x-rapidapi-host": "v3.football.api-sports.io",
      },
    });

    res.json({
      success: true,
      message: "✅ API Football connectée avec succès!",
      account: data.response?.account || {},
      subscription: data.response?.subscription || {},
      apiKey: API_KEY.substring(0, 10) + "..." // Masquer la clé complète
    });
  } catch (error) {
    console.error("❌ Erreur test API Football:", error.message);
    res.status(500).json({ 
      success: false,
      message: "❌ Erreur de connexion à l'API Football",
      error: error.response?.data || error.message
    });
  }
});

// ⚽ Récupérer les scores des matchs avec pronostics uniquement
router.get("/my-pronos", async (req, res) => {
  try {
    if (!API_KEY) {
      return res.status(500).json({ 
        message: "API Football non configurée",
        matches: [] 
      });
    }

    // 1. Récupérer tous les pronostics actifs (en attente)
    const pronostics = await Pronostic.find({ 
      statut: 'en attente',
      sport: 'Football' // Seulement le football
    }).sort({ date: -1 });

    if (pronostics.length === 0) {
      return res.json({ 
        matches: [],
        message: "Aucun pronostic en attente" 
      });
    }

    // 2. Récupérer tous les matchs du jour et en direct
    const today = new Date().toISOString().split("T")[0];
    
    const [liveData, todayData] = await Promise.all([
      axios.get(`${API_BASE_URL}/fixtures`, {
        params: { live: "all" },
        headers: {
          "x-rapidapi-key": API_KEY,
          "x-rapidapi-host": "v3.football.api-sports.io",
        },
      }),
      axios.get(`${API_BASE_URL}/fixtures`, {
        params: { date: today },
        headers: {
          "x-rapidapi-key": API_KEY,
          "x-rapidapi-host": "v3.football.api-sports.io",
        },
      })
    ]);

    // 3. Combiner tous les matchs
    const allMatches = [
      ...(liveData.data.response || []),
      ...(todayData.data.response || [])
    ];

    // 4. Filtrer uniquement les matchs qui correspondent aux pronostics
    const matchesWithPronos = [];

    for (const prono of pronostics) {
      const matchingMatch = allMatches.find(match => {
        const homeTeam = match.teams.home.name.toLowerCase();
        const awayTeam = match.teams.away.name.toLowerCase();
        const equipe1 = prono.equipe1.toLowerCase();
        const equipe2 = prono.equipe2.toLowerCase();

        // Vérifier si les équipes correspondent (dans un ordre ou l'autre)
        return (
          (homeTeam.includes(equipe1) || equipe1.includes(homeTeam)) &&
          (awayTeam.includes(equipe2) || equipe2.includes(awayTeam))
        ) || (
          (homeTeam.includes(equipe2) || equipe2.includes(homeTeam)) &&
          (awayTeam.includes(equipe1) || equipe1.includes(awayTeam))
        );
      });

      if (matchingMatch) {
        matchesWithPronos.push({
          id: matchingMatch.fixture.id,
          status: matchingMatch.fixture.status.short,
          elapsed: matchingMatch.fixture.status.elapsed,
          date: matchingMatch.fixture.date,
          league: matchingMatch.league.name,
          country: matchingMatch.league.country,
          homeTeam: matchingMatch.teams.home.name,
          awayTeam: matchingMatch.teams.away.name,
          homeScore: matchingMatch.goals.home,
          awayScore: matchingMatch.goals.away,
          homeLogo: matchingMatch.teams.home.logo,
          awayLogo: matchingMatch.teams.away.logo,
          // Ajouter les infos du pronostic
          pronostic: {
            _id: prono._id,
            type: prono.type,
            cote: prono.cote,
            confiance: prono.confiance,
            details: prono.details,
            categorie: prono.categorie
          }
        });
      }
    }

    // Supprimer les doublons (au cas où)
    const uniqueMatches = matchesWithPronos.filter(
      (match, index, self) => index === self.findIndex(m => m.id === match.id)
    );

    res.json({ 
      matches: uniqueMatches,
      total: uniqueMatches.length 
    });

  } catch (error) {
    console.error("❌ Erreur récupération scores pronos:", error.message);
    res.status(500).json({ 
      message: "Erreur récupération scores",
      matches: [] 
    });
  }
});

export default router;
