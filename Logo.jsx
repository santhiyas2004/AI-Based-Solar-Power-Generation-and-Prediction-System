import React from "react";
import { motion } from "framer-motion";

/**
 * Sunlytics signature mark: a radiating sun core with an orbiting data ring —
 * a nod to "AI reads the sun". Rays gently rotate on load; the core pulses
 * softly to suggest live measurement.
 */
export default function Logo({ size = 36, showWordmark = true, dark = false }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <motion.svg
          viewBox="0 0 48 48"
          width={size}
          height={size}
          className="absolute inset-0"
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        >
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * 360) / 8;
            return (
              <rect
                key={i}
                x="23"
                y="1.5"
                width="2"
                height="7"
                rx="1"
                fill="#FDB813"
                opacity={0.55 + (i % 2) * 0.25}
                transform={`rotate(${angle} 24 24)`}
              />
            );
          })}
        </motion.svg>
        <motion.div
          className="absolute inset-[9px] rounded-full bg-sun-radial shadow-[0_0_18px_rgba(253,184,19,0.55)]"
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      {showWordmark && (
        <div className="leading-tight">
          <p className={`font-display font-extrabold tracking-tight text-lg ${dark ? "text-white" : "text-ink dark:text-white"}`}>
            Sunlytics
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-solar-500 -mt-0.5">
            Predict · Power
          </p>
        </div>
      )}
    </div>
  );
}
