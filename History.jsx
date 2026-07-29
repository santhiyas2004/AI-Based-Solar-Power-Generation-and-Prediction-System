import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiTrash2, FiDownload, FiInbox } from "react-icons/fi";

import { PageTransition } from "../components/PageShell.jsx";
import { SunSpinner } from "../components/Loaders.jsx";
import { useToast } from "../hooks/useToast.jsx";
import { getHistory, deleteHistoryEntry } from "../services/api.js";

function qualityDot(quality) {
  switch (quality) {
    case "Excellent":
      return "bg-leaf-500";
    case "Good":
      return "bg-sky-500";
    case "Average":
      return "bg-solar-500";
    default:
      return "bg-slate-400";
  }
}

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const { showToast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const res = await getHistory();
      setHistory(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return history;
    const q = query.toLowerCase();
    return history.filter(
      (h) =>
        h.date.includes(q) ||
        h.time.includes(q) ||
        h.quality.toLowerCase().includes(q) ||
        String(h.prediction).includes(q)
    );
  }, [history, query]);

  const handleDelete = async (id) => {
    try {
      await deleteHistoryEntry(id);
      setHistory((h) => h.filter((e) => e.id !== id));
      showToast("Entry deleted", "success");
    } catch {
      showToast("Could not delete entry", "error");
    }
  };

  const exportCSV = () => {
    if (filtered.length === 0) return;
    const headers = ["Date", "Time", "Prediction (kWh)", "Quality", ...Object.keys(filtered[0].inputs)];
    const rows = filtered.map((h) => [
      h.date,
      h.time,
      h.prediction,
      h.quality,
      ...Object.values(h.inputs),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sunlytics_history_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("History exported as CSV", "success");
  };

  return (
    <PageTransition>
      <div className="card p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <p className="section-label">Records</p>
            <h3 className="font-display text-lg font-semibold text-ink dark:text-white">
              {filtered.length} Prediction{filtered.length !== 1 ? "s" : ""}
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search history..."
                className="input-field pl-9 !w-56"
              />
            </div>
            <button onClick={exportCSV} className="btn-secondary !px-4 !py-2.5">
              <FiDownload size={15} /> Export CSV
            </button>
          </div>
        </div>

        {loading ? (
          <SunSpinner label="Loading history..." />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <FiInbox size={32} className="text-slate-300" />
            <p className="text-sm text-slate-400">No predictions found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-100 dark:border-white/10">
                  <th className="py-3 font-medium">Date</th>
                  <th className="py-3 font-medium">Time</th>
                  <th className="py-3 font-medium">Prediction</th>
                  <th className="py-3 font-medium">Quality</th>
                  <th className="py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((h) => (
                    <motion.tr
                      key={h.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="border-b border-slate-50 dark:border-white/5 hover:bg-slate-50/70 dark:hover:bg-white/5"
                    >
                      <td className="py-3 font-mono text-xs text-slate-500">{h.date}</td>
                      <td className="py-3 font-mono text-xs text-slate-500">{h.time}</td>
                      <td className="py-3 font-semibold text-ink dark:text-white">{h.prediction} kWh</td>
                      <td className="py-3">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                          <span className={`w-1.5 h-1.5 rounded-full ${qualityDot(h.quality)}`} />
                          {h.quality}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleDelete(h.id)}
                          className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                        >
                          <FiTrash2 size={15} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
