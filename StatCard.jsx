import React from "react";
import { motion } from "framer-motion";

export default function StatCard({ icon: Icon, label, value, unit, accent = "solar", delay = 0 }) {
  const accents = {
    solar: "bg-solar-50 text-solar-600 dark:bg-solar-500/10 dark:text-solar-400",
    leaf: "bg-leaf-50 text-leaf-600 dark:bg-leaf-500/10 dark:text-leaf-500",
    sky: "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-500",
    ink: "bg-slate-100 text-ink dark:bg-white/5 dark:text-slate-100",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      whileHover={{ y: -4 }}
      className="card p-5 flex items-start justify-between gap-4"
    >
      <div className="min-w-0">
        <p className="section-label">{label}</p>
        <p className="mt-2 font-display text-2xl font-bold text-ink dark:text-white truncate">
          {value}
          {unit && <span className="text-sm font-medium text-slate-400 ml-1">{unit}</span>}
        </p>
      </div>
      <div className={`shrink-0 rounded-xl p-3 ${accents[accent]}`}>
        <Icon size={22} />
      </div>
    </motion.div>
  );
}
