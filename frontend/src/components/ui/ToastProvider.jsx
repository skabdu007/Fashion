import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const ToastContext = createContext(null);
const MotionDiv = motion.div;

const DEFAULT_DURATION = 3200;

export function ToastProvider({ children }) {
  const idRef = useRef(0);
  const timeoutRef = useRef(new Map());
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    const timeoutId = timeoutRef.current.get(id);

    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutRef.current.delete(id);
    }

    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback(
    ({ type = "success", title, message, duration = DEFAULT_DURATION }) => {
      const safeTitle = String(title || "Notice");
      const safeMessage = String(message || "");

      const duplicateToast = toasts.find(
        (toast) =>
          toast.type === type &&
          toast.title === safeTitle &&
          toast.message === safeMessage
      );

      if (duplicateToast) {
        return duplicateToast.id;
      }

      const id = idRef.current++;
      setToasts((current) => [...current, { id, type, title: safeTitle, message: safeMessage }]);

      if (duration > 0) {
        const timeoutId = setTimeout(() => dismissToast(id), duration);
        timeoutRef.current.set(id, timeoutId);
      }

      return id;
    },
    [dismissToast, toasts]
  );

  useEffect(() => {
    const activeTimeouts = timeoutRef.current;

    return () => {
      activeTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
      activeTimeouts.clear();
    };
  }, []);

  const value = useMemo(
    () => ({
      toast: pushToast,
      success: (message, title = "Success") =>
        pushToast({ type: "success", title, message }),
      error: (message, title = "Something went wrong") =>
        pushToast({ type: "error", title, message }),
      warning: (message, title = "Please check this") =>
        pushToast({ type: "warning", title, message }),
      info: (message, title = "Info") =>
        pushToast({ type: "info", title, message }),
      dismiss: dismissToast
    }),
    [dismissToast, pushToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="toast-region">
        <AnimatePresence>
          {toasts.map((toast) => (
            <MotionDiv
              key={toast.id}
              className={`toast-card toast-${toast.type}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
            >
              <div className="toast-copy">
                <strong>{toast.title}</strong>
                <span>{toast.message}</span>
              </div>

              <button onClick={() => dismissToast(toast.id)}>×</button>
            </MotionDiv>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}
