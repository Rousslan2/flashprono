import { io } from 'socket.io-client';
import { API_BASE } from '../config';

// Connexion au serveur Socket.io
const socket = io(API_BASE, {
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
});

// Événements de connexion
socket.on('connect', () => {
  console.log('✅ Socket.io connecté:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('❌ Socket.io déconnecté:', reason);
});

socket.on('connect_error', (error) => {
  console.error('🔴 Erreur Socket.io:', error.message);
});

export default socket;
