import { AnimatePresence } from "framer-motion";
import { Routes, useLocation } from "react-router-dom";

export default function RouteAnimator({ children }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {children}
      </Routes>
    </AnimatePresence>
  );
}
