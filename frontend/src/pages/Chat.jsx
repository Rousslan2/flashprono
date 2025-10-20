import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { API_BASE } from "../config";
import socket from "../services/socket";
import { useRealtimeUser, isSubscriptionActive } from "../hooks/useAuth";
import { Link } from "react-router-dom";

export default function Chat() {
  const user = useRealtimeUser();
  const active = isSubscriptionActive();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!active) {
      setLoading(false);
      return;
    }

    const loadMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(`${API_BASE}/api/chat/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(data);
        setTimeout(scrollToBottom, 100);
      } catch (err) {
        console.error("❌ Erreur chargement messages:", err);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();

    const handleNewMessage = (message) => {
      console.log("💬 Nouveau message:", message);
      setMessages((prev) => [...prev, message]);
      setTimeout(scrollToBottom, 100);
    };

    const handleDeleteMessage = ({ _id }) => {
      console.log("🗑️ Message supprimé:", _id);
      setMessages((prev) => prev.filter((m) => m._id !== _id));
    };

    socket.on("chat:message", handleNewMessage);
    socket.on("chat:delete", handleDeleteMessage);

    return () => {
      socket.off("chat:message", handleNewMessage);
      socket.off("chat:delete", handleDeleteMessage);
    };
  }, [active]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE}/api/chat/messages`,
        { message: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewMessage("");
    } catch (err) {
      alert(err.response?.data?.message || "Erreur envoi message");
    } finally {
      setSending(false);
    }
  };

  const deleteMessage = async (messageId) => {
    if (!confirm("Supprimer ce message ?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE}/api/chat/messages/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      alert(err.response?.data?.message || "Erreur suppression");
    }
  };

  if (loading) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-6xl mb-4 animate-bounce">💬</div>
          <p className="text-gray-400">Chargement du chat...</p>
        </div>
      </section>
    );
  }

  if (!active) {
    return (
      <section className="py-20 px-4 text-center relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
          <div className="absolute top-20 left-10 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 bg-cyan-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 bg-blue-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        </div>

        <div className="max-w-3xl mx-auto relative z-10">
          <div className="mb-8 animate-float">
            <div className="inline-block w-24 h-24 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mb-6 text-5xl border-4 border-white/20 shadow-2xl">
              🔒
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent animate-gradient">
                Chat Communautaire
              </span>
              <br />
              <span className="text-white drop-shadow-glow">Réservé aux membres VIP</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300 leading-relaxed mb-8">
              Échange en <span className="text-cyan-400 font-bold">temps réel</span> avec les autres membres, partage tes analyses et stratégies !
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <FeaturePreview icon="💬" title="Chat instantané" desc="Messages en temps réel" />
            <FeaturePreview icon="🤝" title="Communauté active" desc="Entraide et partage" />
            <FeaturePreview icon="💡" title="Tips & analyses" desc="Stratégies collectives" />
          </div>

          <Link to="/abonnements" className="group relative inline-block">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-12 py-5 rounded-2xl font-black text-xl hover:scale-110 transition-all duration-300 shadow-2xl">
              ✨ Devenir membre VIP
            </div>
          </Link>
        </div>

        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          @keyframes gradient {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
          .animate-gradient {
            background-size: 200% auto;
            animation: gradient 3s linear infinite;
          }
          .drop-shadow-glow {
            filter: drop-shadow(0 0 20px rgba(103, 232, 249, 0.3));
          }
        `}</style>
      </section>
    );
  }

  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block px-4 py-2 bg-cyan-500/20 border border-cyan-500 rounded-full mb-4 hover:scale-105 transition-transform">
            <span className="text-cyan-400 font-semibold text-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
              💬 Chat communautaire
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Discutez entre membres
            </span>
          </h1>
          <p className="text-xl text-gray-300">
            Partagez vos analyses et stratégies en temps réel
          </p>
        </div>

        {/* Chat Box */}
        <div className="bg-gradient-to-br from-black via-gray-900 to-black border-2 border-cyan-500/30 rounded-2xl overflow-hidden shadow-2xl hover:shadow-cyan-500/20 transition-shadow duration-300">
          {/* Messages */}
          <div className="h-[500px] overflow-y-auto p-6 space-y-4 scroll-smooth">
            {messages.length === 0 ? (
              <div className="text-center py-20 animate-fade-in">
                <div className="text-7xl mb-6 animate-bounce">💬</div>
                <h3 className="text-2xl font-bold text-white mb-2">Aucun message pour le moment</h3>
                <p className="text-gray-400">Sois le premier à écrire !</p>
                <div className="mt-6 inline-block">
                  <div className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                    <span className="text-cyan-400 text-sm font-semibold">En attente de messages...</span>
                  </div>
                </div>
              </div>
            ) : (
              messages.map((msg, index) => (
                <MessageBubble
                  key={msg._id}
                  message={msg}
                  isOwn={msg.userId === user?._id}
                  canDelete={user?.isAdmin || msg.userId === user?._id}
                  onDelete={deleteMessage}
                  delay={index * 50}
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="border-t-2 border-cyan-500/20 p-4 bg-black/50">
            <div className="flex gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Écris un message..."
                maxLength={1000}
                className="flex-1 px-4 py-3 bg-gray-900 border-2 border-cyan-500/40 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-all duration-300"
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-bold hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
              >
                {sending ? "⏳" : "📤"} Envoyer
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-2 flex items-center justify-between">
              <span>{newMessage.length}/1000 caractères</span>
              {newMessage.trim() && (
                <span className="text-cyan-400 animate-pulse">Appuie sur Entrée pour envoyer</span>
              )}
            </div>
          </form>
        </div>

        {/* Info */}
        <div className="mt-6 bg-cyan-500/10 border-2 border-cyan-500/30 rounded-xl p-4 hover:bg-cyan-500/15 transition-colors">
          <p className="text-sm text-gray-300">
            💡 <strong className="text-cyan-400">Conseils</strong> : Respecte les autres membres, partage tes analyses, et
            reste fair-play ! Les messages inappropriés seront supprimés.
          </p>
        </div>
      </div>
    </section>
  );
}

function MessageBubble({ message, isOwn, canDelete, onDelete, delay }) {
  return (
    <div 
      className={`flex ${isOwn ? "justify-end" : "justify-start"} animate-slide-in`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`max-w-[70%] ${isOwn ? "items-end" : "items-start"}`}>
        {/* Nom + badge admin */}
        <div className={`flex items-center gap-2 mb-1 ${isOwn ? "flex-row-reverse" : ""}`}>
          <span className="text-sm font-semibold text-gray-300">{message.userName}</span>
          {message.userIsAdmin && (
            <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full text-xs font-bold animate-pulse">
              👑 ADMIN
            </span>
          )}
        </div>

        {/* Bulle de message */}
        <div
          className={`relative px-4 py-3 rounded-2xl transition-all duration-300 hover:scale-[1.02] ${
            isOwn
              ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg"
              : message.userIsAdmin
              ? "bg-yellow-500/20 border-2 border-yellow-500/30 text-white"
              : "bg-gray-800 border-2 border-gray-700 text-white"
          }`}
        >
          <p className="break-words whitespace-pre-wrap">{message.message}</p>

          {/* Timestamp */}
          <div className={`text-xs mt-1 ${isOwn ? "text-white/70" : "text-gray-400"}`}>
            {new Date(message.timestamp).toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>

          {/* Bouton supprimer */}
          {canDelete && (
            <button
              onClick={() => onDelete(message._id)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs hover:scale-125 hover:bg-red-600 transition-all duration-200 shadow-lg"
              title="Supprimer ce message"
            >
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function FeaturePreview({ icon, title, desc }) {
  return (
    <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border-2 border-cyan-500/30 rounded-2xl p-6 text-center transform hover:scale-110 hover:-rotate-2 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/30 cursor-pointer">
      <div className="text-5xl mb-4 animate-bounce">{icon}</div>
      <h3 className="text-white font-bold mb-2 text-lg">{title}</h3>
      <p className="text-gray-400 text-sm">{desc}</p>
    </div>
  );
}
