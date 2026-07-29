import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiSun, FiArrowLeft } from "react-icons/fi";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="w-20 h-20 rounded-full bg-sun-radial shadow-glow flex items-center justify-center mb-6"
      >
        <FiSun className="text-navy-900" size={32} />
      </motion.div>
      <h1 className="font-display text-5xl font-extrabold text-ink dark:text-white">404</h1>
      <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-sm">
        This panel isn't catching any signal. The page you're looking for doesn't exist.
      </p>
      <Link to="/" className="btn-primary mt-6">
        <FiArrowLeft /> Back to Dashboard
      </Link>
    </div>
  );
}
