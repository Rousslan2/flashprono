import express from "express";
import axios from "axios";

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

export default router;
