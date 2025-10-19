
import React, { useEffect, useState } from 'react';

const PublicStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats/public')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Erreur lors du chargement des statistiques :', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center text-gray-500">Chargement des statistiques...</div>;
  }

  if (!stats) {
    return <div className="text-center text-red-500">Impossible de charger les statistiques.</div>;
  }

  return (
    <div className="bg-white shadow rounded p-6 my-6">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">🔥 Nos Statistiques Récentes</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-center">
        <div>
          <p className="text-xl font-semibold text-green-600">{stats.tauxReussite}</p>
          <p className="text-gray-600">Taux de réussite</p>
        </div>
        <div>
          <p className="text-xl font-semibold text-blue-600">{stats.unitsGagnees} u</p>
          <p className="text-gray-600">Unités gagnées</p>
        </div>
        <div>
          <p className="text-xl font-semibold text-purple-600">{stats.pronosticsCeMois}</p>
          <p className="text-gray-600">Pronos ce mois</p>
        </div>
        <div>
          <p className="text-xl font-semibold text-indigo-600">{stats.pronosticsCetteSemaine}</p>
          <p className="text-gray-600">Pronos cette semaine</p>
        </div>
        <div>
          <p className="text-xl font-semibold text-pink-600">{stats.membres}</p>
          <p className="text-gray-600">Membres inscrits</p>
        </div>
      </div>
    </div>
  );
};

export default PublicStats;
