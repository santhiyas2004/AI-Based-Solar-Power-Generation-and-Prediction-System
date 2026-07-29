import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiSun, FiZap, FiTarget, FiActivity, FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip as RTooltip,
} from "recharts";

import { PageTransition } from "../components/PageShell.jsx";
import StatCard from "../components/StatCard.jsx";
import { CardSkeleton } from "../components/Loaders.jsx";
import { getModelInfo, getHistory } from "../services/api.js";

export default function Dashboard() {
  const [modelInfo, setModelInfo] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [infoRes, historyRes] = await Promise.all([getModelInfo(), getHistory()]);
        setModelInfo(infoRes.data);
        setHistory(historyRes.data);
      } catch (e) {
        // handled visually via empty state
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const latest = history[0];
  const avgIrradiance = latest ? latest.inputs.Solar_Irradiance : 780;
  const trendData = [...history]
    .slice(0, 12)
    .reverse()
    .map((h, i) => ({ name: `#${i + 1}`, value: h.prediction }));

  const now = new Date();

  return (
    <PageTransition>
      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-dusk-navy text-white p-6 sm:p-8 shadow-premium"
      >
        <div className="absolute -right-10 -top-10 w-52 h-52 rounded-full bg-solar-500/20 blur-3xl" />
        <div className="absolute right-16 bottom-0 w-32 h-32 rounded-full bg-leaf-500/10 blur-2xl" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="section-label">
              {now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })} · {now.toLocaleTimeString(undefined, { hour12: true })}
            </p>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold">
              Welcome back to Sunlytics ☀️
            </h2>
            <p className="mt-1 text-slate-300 max-w-xl text-sm sm:text-base">
              Predict Smarter. Power Greener. Your Random Forest engine is warmed up and ready for the next forecast.
            </p>
          </div>
          <Link to="/prediction" className="btn-primary shrink-0">
            New Prediction <FiArrowRight />
          </Link>
        </div>

        <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10 text-sm">
          <div>
            <p className="text-slate-400 text-xs">Model</p>
            <p className="font-display font-semibold mt-0.5">Random Forest</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs">Model Accuracy</p>
            <p className="font-display font-semibold mt-0.5 text-solar-400">
              {modelInfo ? `${(modelInfo.metrics.r2_score * 100).toFixed(2)}%` : "—"}
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-xs">Dataset Size</p>
            <p className="font-display font-semibold mt-0.5">
              {modelInfo ? modelInfo.dataset_size.toLocaleString() : "10,000"} records
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-xs">Features</p>
            <p className="font-display font-semibold mt-0.5">{modelInfo ? modelInfo.n_features : "—"}</p>
          </div>
        </div>
      </motion.div>

      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={FiSun}
            label="Solar Irradiance"
            value={avgIrradiance ? Number(avgIrradiance).toFixed(0) : "—"}
            unit="W/m²"
            accent="solar"
            delay={0}
          />
          <StatCard
            icon={FiZap}
            label="Predicted Output"
            value={latest ? latest.prediction.toFixed(2) : "—"}
            unit="kWh"
            accent="leaf"
            delay={0.05}
          />
          <StatCard
            icon={FiTarget}
            label="Model Accuracy"
            value={modelInfo ? (modelInfo.metrics.r2_score * 100).toFixed(2) : "—"}
            unit="%"
            accent="sky"
            delay={0.1}
          />
          <StatCard
            icon={FiActivity}
            label="Predictions Completed"
            value={history.length}
            accent="ink"
            delay={0.15}
          />
        </div>
      )}

      {/* Trend teaser */}
      <div className="card p-5 sm:p-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="section-label">Recent Activity</p>
            <h3 className="font-display text-lg font-semibold text-ink dark:text-white">Prediction Trend</h3>
          </div>
          <Link to="/analytics" className="text-sm font-medium text-solar-600 hover:text-solar-700 flex items-center gap-1">
            View full analytics <FiArrowRight size={14} />
          </Link>
        </div>
        {trendData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FDB813" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#FDB813" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94A3B8" />
              <RTooltip
                formatter={(v) => [`${v} kWh`, "Predicted Output"]}
                contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 8px 24px -8px rgba(15,23,42,0.15)" }}
              />
              <Area type="monotone" dataKey="value" stroke="#FDB813" strokeWidth={2.5} fill="url(#trendFill)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="py-16 text-center text-sm text-slate-400">
            No predictions yet — head to the{" "}
            <Link to="/prediction" className="text-solar-600 font-medium">
              Prediction
            </Link>{" "}
            page to generate your first forecast.
          </div>
        )}
      </div>
    </PageTransition>
  );
}
