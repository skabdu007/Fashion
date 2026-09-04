import { motion } from "framer-motion";

const MotionDiv = motion.div;

export default function PageTransition({ children, className = "" }) {
  return (
    <MotionDiv
      className={`page-transition ${className}`.trim()}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      {children}
    </MotionDiv>
  );
}
