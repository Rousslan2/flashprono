import { useState, useEffect } from 'react';
import { listenUserUpdate, getStoredUser } from '../utils/userSync';

export const useSyncedUser = () => {
  const [user, setUser] = useState(getStoredUser());

  useEffect(() => {
    // Écouter les mises à jour du localStorage
    const unsubscribe = listenUserUpdate((userData) => {
      setUser(userData);
    });

    // Écouter aussi les changements directs du localStorage (autre onglet)
    const handleStorageChange = (e) => {
      if (e.key === 'user') {
        setUser(getStoredUser());
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return user;
};
