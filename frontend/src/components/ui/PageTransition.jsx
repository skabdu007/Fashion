import { motion } from "framer-motion";

const MotionDiv = motion.div;

export default function PageTransition({ children, className = "" }) {
  return (
    <MotionDiv
      className={`page-transition ${className}`.trim()}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      {children}
    </MotionDiv>
  );
}
