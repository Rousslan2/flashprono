import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { API_BASE } from "../config";
import socket from "../services/socket";
import { useRealtimeUser } from "../hooks/useAuth";

export default function Chat() {
  const user = useRealtimeUser();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
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

    // 🔥 Écouter les nouveaux messages en temps réel
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
  }, []);

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

  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block px-4 py-2 bg-primary/20 border border-primary rounded-full mb-4">
            <span className="text-primary font-semibold text-sm">💬 Chat communautaire</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            <span className="bg-gradient-to-r from-primary to-yellow-400 bg-clip-text text-transparent">
              Discutez entre membres
            </span>
          </h1>
          <p className="text-xl text-gray-300">
            Partagez vos analyses et stratégies en temps réel
          </p>
        </div>

        {/* Chat Box */}
        <div className="bg-gradient-to-br from-black via-gray-900 to-black border-2 border-primary/30 rounded-2xl overflow-hidden">
          {/* Messages */}
          <div className="h-[500px] overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">💬</div>
                <p className="text-gray-400">Aucun message pour le moment</p>
                <p className="text-gray-500 text-sm mt-2">Sois le premier à écrire !</p>
              </div>
            ) : (
              messages.map((msg) => (
                <MessageBubble
                  key={msg._id}
                  message={msg}
                  isOwn={msg.userId === user?._id}
                  canDelete={user?.isAdmin || msg.userId === user?._id}
                  onDelete={deleteMessage}
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="border-t-2 border-primary/20 p-4 bg-black/50">
            <div className="flex gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Écris un message..."
                maxLength={1000}
                className="flex-1 px-4 py-3 bg-gray-900 border border-primary/40 rounded-xl text-white focus:outline-none focus:border-primary transition"
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="px-6 py-3 bg-primary text-black rounded-xl font-bold hover:scale-105 transition disabled:opacity-50 disabled:hover:scale-100"
              >
                {sending ? "⏳" : "📤"} Envoyer
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              {newMessage.length}/1000 caractères
            </div>
          </form>
        </div>

        {/* Info */}
        <div className="mt-6 bg-primary/10 border border-primary/30 rounded-xl p-4">
          <p className="text-sm text-gray-300">
            💡 <strong>Conseils</strong> : Respecte les autres membres, partage tes analyses, et
            reste fair-play ! Les messages inappropriés seront supprimés.
          </p>
        </div>
      </div>
    </section>
  );
}

function MessageBubble({ message, isOwn, canDelete, onDelete }) {
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[70%] ${isOwn ? "items-end" : "items-start"}`}>
        {/* Nom + badge admin */}
        <div className={`flex items-center gap-2 mb-1 ${isOwn ? "flex-row-reverse" : ""}`}>
          <span className="text-sm font-semibold text-gray-300">{message.userName}</span>
          {message.userIsAdmin && (
            <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded text-xs font-bold">
              👑 ADMIN
            </span>
          )}
        </div>

        {/* Bulle de message */}
        <div
          className={`relative px-4 py-3 rounded-2xl ${
            isOwn
              ? "bg-primary text-black"
              : message.userIsAdmin
              ? "bg-yellow-500/20 border border-yellow-500/30 text-white"
              : "bg-gray-800 text-white"
          }`}
        >
          <p className="break-words whitespace-pre-wrap">{message.message}</p>

          {/* Timestamp */}
          <div
            className={`text-xs mt-1 ${
              isOwn ? "text-black/70" : "text-gray-400"
            }`}
          >
            {new Date(message.timestamp).toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>

          {/* Bouton supprimer */}
          {canDelete && (
            <button
              onClick={() => onDelete(message._id)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs hover:scale-110 transition"
            >
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
