import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { ToastContainer } from './Toast';

const defaultToastContext = {
  addToast: () => {},
  removeToast: () => {}
};

const ToastContext = createContext(defaultToastContext);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  // Cleanup all pending timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
      timersRef.current.clear();
    };
  }, []);

  const removeToast = useCallback((id) => {
    if (timersRef.current.has(id)) {
      clearTimeout(timersRef.current.get(id));
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(({ title, message, type = 'info', duration = 4000 }) => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newToast = { id, title, message, type };

    setToasts((prev) => {
      // Prevent rapid duplicate toast flooding
      if (prev.some((t) => t.title === title && t.message === message)) {
        return prev;
      }
      return [...prev, newToast];
    });

    if (duration > 0) {
      const timer = setTimeout(() => {
        removeToast(id);
      }, duration);
      timersRef.current.set(id, timer);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext) || defaultToastContext;
