// frontend/src/App.jsx
import "./axiosSetup";
import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Pronostics from "./pages/Pronostics";
import Abonnements from "./pages/Abonnements";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Success from "./pages/Success";
import Admin from "./pages/Admin";
import PronosEnOr from "./pages/PronosEnOr";
import StrategieBankroll from "./pages/StrategieBankroll";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

import { startHeartbeat } from "./heartbeat"; // présence en ligne (déjà existant)

// 👇👇👇 NOUVEAU : pages Stats (public) + Récap (membres)
import Stats from "./pages/Stats";
import Recap from "./pages/Recap";

export default function App() {
  useEffect(() => { startHeartbeat(); }, []);

  return (
    <div className="bg-dark min-h-screen text-white flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pronostics" element={<Pronostics />} />
          <Route path="/abonnements" element={<Abonnements />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/success" element={<Success />} />

          {/* Public */}
          <Route path="/stats" element={<Stats />} />      {/* 👈 NOUVEAU */}

          {/* Espace membre (protégé) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Récap membre (protégé) */}
          <Route
            path="/recap"
            element={
              <ProtectedRoute>
                <Recap />                                  {/* 👈 NOUVEAU */}
              </ProtectedRoute>
            }
          />

          {/* Admin (protégé + admin) */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            }
          />

          {/* Pages existantes protégées */}
          <Route
            path="/pronos-en-or"
            element={
              <ProtectedRoute>
                <PronosEnOr />
              </ProtectedRoute>
            }
          />
          <Route
            path="/strategie-bankroll"
            element={
              <ProtectedRoute>
                <StrategieBankroll />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
