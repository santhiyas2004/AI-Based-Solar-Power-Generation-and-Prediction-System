import React from "react";
import { motion } from "framer-motion";

export function SunSpinner({ size = 40, label }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10">
      <div className="relative" style={{ width: size, height: size }}>
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-solar-100 dark:border-white/10"
        />
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-solar-500"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
        />
      </div>
      {label && <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{label}</p>}
    </div>
  );
}

export function Skeleton({ className = "" }) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-slate-100 dark:bg-white/5 ${className}`}
    >
      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 dark:via-white/10 to-transparent"
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="card p-5 space-y-3">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-6 w-32" />
    </div>
  );
}
