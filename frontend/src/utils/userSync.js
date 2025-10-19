// Système de synchronisation des données utilisateur en temps réel

export const USER_UPDATED_EVENT = 'userDataUpdated';

// Émettre un événement quand les données utilisateur changent
export const emitUserUpdate = (userData) => {
  localStorage.setItem('user', JSON.stringify(userData));
  window.dispatchEvent(new CustomEvent(USER_UPDATED_EVENT, { detail: userData }));
};

// Écouter les changements de données utilisateur
export const listenUserUpdate = (callback) => {
  const handler = (event) => callback(event.detail);
  window.addEventListener(USER_UPDATED_EVENT, handler);
  return () => window.removeEventListener(USER_UPDATED_EVENT, handler);
};

// Récupérer l'utilisateur du localStorage
export const getStoredUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};
