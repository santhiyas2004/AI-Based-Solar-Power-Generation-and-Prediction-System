import React, { useState } from "react";
import { FiInfo } from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";

export default function Tooltip({ text }) {
  const [show, setShow] = useState(false);

  return (
    <span
      className="relative inline-flex items-center"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <FiInfo size={13} className="text-slate-400 hover:text-solar-500 cursor-help" />
      <AnimatePresence>
        {show && (
          <motion.span
            initial={{ opacity: 0, y: 4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ duration: 0.12 }}
            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 rounded-lg bg-navy-900 text-slate-100 text-xs px-3 py-2 shadow-lg"
          >
            {text}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
