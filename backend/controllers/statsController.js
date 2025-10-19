
import Pronostic from '../models/Pronostic.js';
import User from '../models/User.js';

export const getPublicStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    const allPronostics = await Pronostic.find({ statut: { $in: ['gagné', 'perdu'] } });
    const monthPronostics = await Pronostic.find({
      statut: { $in: ['gagné', 'perdu'] },
      date: { $gte: startOfMonth }
    });
    const weekPronostics = await Pronostic.find({
      statut: { $in: ['gagné', 'perdu'] },
      date: { $gte: startOfWeek }
    });

    const gagnés = allPronostics.filter(p => p.statut === 'gagné').length;
    const total = allPronostics.length;
    const tauxReussite = total > 0 ? ((gagnés / total) * 100).toFixed(1) : 0;

    const unitsGagnees = allPronostics.reduce((sum, p) => {
      if (p.statut === 'gagné') return sum + (p.cote - 1);
      else return sum - 1;
    }, 0).toFixed(2);

    const membresCount = await User.countDocuments();

    res.json({
      tauxReussite: `${tauxReussite}%`,
      totalPronostics: total,
      unitsGagnees,
      pronosticsCeMois: monthPronostics.length,
      pronosticsCetteSemaine: weekPronostics.length,
      membres: membresCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
