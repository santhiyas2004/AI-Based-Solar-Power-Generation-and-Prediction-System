import React from "react";
import { motion } from "framer-motion";

export function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="px-4 sm:px-8 py-6 space-y-6"
    >
      {children}
    </motion.div>
  );
}

export function Footer() {
  return (
    <footer className="px-4 sm:px-8 py-6 mt-6 border-t border-slate-200/70 dark:border-white/5 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
      <p>© {new Date().getFullYear()} Sunlytics — AI Powered Solar Power Prediction System</p>
      <p className="font-mono">Predict Smarter. Power Greener.</p>
    </footer>
  );
}
