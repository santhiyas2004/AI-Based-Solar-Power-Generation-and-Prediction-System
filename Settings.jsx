import React, { useState } from "react";
import { FiSun, FiMoon, FiTrash2, FiUser, FiGithub, FiMail } from "react-icons/fi";

import { PageTransition } from "../components/PageShell.jsx";
import { useTheme } from "../hooks/useTheme.jsx";
import { useToast } from "../hooks/useToast.jsx";
import { clearHistory } from "../services/api.js";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();
  const [confirming, setConfirming] = useState(false);

  const handleReset = async () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    try {
      await clearHistory();
      showToast("Prediction history cleared", "success");
    } catch {
      showToast("Could not clear history", "error");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <PageTransition>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appearance */}
        <div className="card p-6">
          <p className="section-label">Appearance</p>
          <h3 className="font-display text-lg font-semibold text-ink dark:text-white mb-4">Theme</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setTheme("light")}
              className={`rounded-xl border-2 p-4 flex flex-col items-center gap-2 transition-colors ${
                theme === "light" ? "border-solar-500 bg-solar-50" : "border-slate-200 dark:border-white/10"
              }`}
            >
              <FiSun size={22} className="text-solar-500" />
              <span className="text-sm font-medium text-ink dark:text-slate-200">Light Mode</span>
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`rounded-xl border-2 p-4 flex flex-col items-center gap-2 transition-colors ${
                theme === "dark" ? "border-solar-500 bg-navy-900" : "border-slate-200 dark:border-white/10"
              }`}
            >
              <FiMoon size={22} className="text-sky-400" />
              <span className="text-sm font-medium text-ink dark:text-slate-200">Dark Mode</span>
            </button>
          </div>
        </div>

        {/* Data management */}
        <div className="card p-6">
          <p className="section-label">Data</p>
          <h3 className="font-display text-lg font-semibold text-ink dark:text-white mb-4">Prediction History</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Permanently remove every saved prediction from Sunlytics. This action can't be undone.
          </p>
          <button
            onClick={handleReset}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 font-display font-medium transition-colors ${
              confirming
                ? "bg-red-500 text-white hover:bg-red-600"
                : "border border-red-200 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
            }`}
          >
            <FiTrash2 size={16} />
            {confirming ? "Click again to confirm" : "Reset Prediction History"}
          </button>
        </div>

        {/* About developer */}
        <div className="card p-6 lg:col-span-2">
          <p className="section-label">About</p>
          <h3 className="font-display text-lg font-semibold text-ink dark:text-white mb-4">About the Developer</h3>
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-dusk-navy flex items-center justify-center shrink-0">
              <FiUser className="text-solar-400" size={24} />
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400 space-y-2">
              <p>
                <strong className="text-ink dark:text-white">Sunlytics</strong> was built as a final-year
                engineering project — an AI-powered dashboard that turns a trained Random Forest model into
                a production-quality solar power prediction system.
              </p>
              <p>
                Tech stack: React, Tailwind CSS, Framer Motion, Recharts on the frontend; Flask, scikit-learn,
                pandas and joblib on the backend.
              </p>
              <div className="flex items-center gap-4 pt-2">
                <span className="inline-flex items-center gap-1.5 text-ink dark:text-slate-200">
                  <FiGithub size={14} /> github.com/your-username/sunlytics
                </span>
                <span className="inline-flex items-center gap-1.5 text-ink dark:text-slate-200">
                  <FiMail size={14} /> you@example.com
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
