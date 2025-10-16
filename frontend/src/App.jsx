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

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

export default function App() {
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

          {/* Espace membre (protégé) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
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
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
