import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [activeActionModal, setActiveActionModal] = useState(null); // { transaction, onComplete }
  const [systemHealth, setSystemHealth] = useState({ backend: true, mlEngine: true, loading: true });
  const [refreshKey, setRefreshKey] = useState(0);

  const addToast = useCallback((message, type = 'info', duration = 4500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const triggerRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  const openActionModal = useCallback((transaction, onComplete) => {
    setActiveActionModal({ transaction, onComplete });
  }, []);

  const closeActionModal = useCallback(() => {
    setActiveActionModal(null);
  }, []);

  const checkHealth = useCallback(async () => {
    try {
      const res = await api.getHealth();
      setSystemHealth({
        backend: true,
        mlEngine: true,
        database: res.database,
        loading: false
      });
    } catch (err) {
      setSystemHealth({
        backend: false,
        mlEngine: false,
        database: 'Unavailable',
        loading: false
      });
    }
  }, []);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  const value = {
    toasts,
    addToast,
    removeToast,
    activeActionModal,
    openActionModal,
    closeActionModal,
    systemHealth,
    refreshKey,
    triggerRefresh,
    checkHealth
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
