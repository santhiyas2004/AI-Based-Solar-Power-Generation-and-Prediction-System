import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiCpu, FiDatabase, FiLayers, FiArrowDown } from "react-icons/fi";

import { PageTransition } from "../components/PageShell.jsx";
import { SunSpinner } from "../components/Loaders.jsx";
import { getModelInfo } from "../services/api.js";

export default function AIModel() {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    getModelInfo().then((res) => setInfo(res.data));
  }, []);

  if (!info) {
    return (
      <PageTransition>
        <div className="card"><SunSpinner label="Loading model details..." /></div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6 lg:col-span-1">
          <div className="w-12 h-12 rounded-xl bg-solar-50 dark:bg-solar-500/10 flex items-center justify-center mb-4">
            <FiCpu className="text-solar-500" size={22} />
          </div>
          <p className="section-label">Algorithm</p>
          <h3 className="font-display text-xl font-bold text-ink dark:text-white mt-1">{info.algorithm}</h3>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Estimators (trees)</span>
              <span className="font-mono text-ink dark:text-white">{info.n_estimators}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Max depth</span>
              <span className="font-mono text-ink dark:text-white">{info.max_depth}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Criterion</span>
              <span className="font-mono text-ink dark:text-white">{info.metrics.best_params.criterion}</span>
            </div>
          </div>
        </div>

        <div className="card p-6 lg:col-span-1">
          <div className="w-12 h-12 rounded-xl bg-leaf-50 dark:bg-leaf-500/10 flex items-center justify-center mb-4">
            <FiDatabase className="text-leaf-500" size={22} />
          </div>
          <p className="section-label">Dataset</p>
          <h3 className="font-display text-xl font-bold text-ink dark:text-white mt-1">
            {info.dataset_size.toLocaleString()} Records
          </h3>
          <p className="text-sm text-slate-500 mt-2">
            Cleaned and feature-engineered from the original solar power prediction dataset — identifier
            columns dropped, timestamp converted into an hour-of-day feature.
          </p>
        </div>

        <div className="card p-6 lg:col-span-1">
          <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center mb-4">
            <FiLayers className="text-sky-500" size={22} />
          </div>
          <p className="section-label">Features Used ({info.n_features})</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {info.features.map((f) => (
              <span
                key={f}
                className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 text-ink dark:text-slate-200"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Workflow */}
      <div className="card p-6 sm:p-8">
        <p className="section-label">Pipeline</p>
        <h3 className="font-display text-lg font-semibold text-ink dark:text-white mb-6">Model Workflow</h3>
        <div className="flex flex-col items-center gap-1">
          {info.workflow.map((step, i) => (
            <React.Fragment key={step}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="w-full max-w-md rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-800 px-5 py-3 text-center font-medium text-sm text-ink dark:text-slate-100 shadow-sm"
              >
                {step}
              </motion.div>
              {i < info.workflow.length - 1 && (
                <FiArrowDown className="text-solar-400 my-1" size={16} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Evaluation metrics */}
      <div className="card p-6 sm:p-8">
        <p className="section-label">Evaluation</p>
        <h3 className="font-display text-lg font-semibold text-ink dark:text-white mb-5">Model Performance</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "R² Score", value: info.metrics.r2_score.toFixed(4) },
            { label: "MAE", value: info.metrics.mae.toFixed(4) },
            { label: "MSE", value: info.metrics.mse.toFixed(4) },
            { label: "RMSE", value: info.metrics.rmse.toFixed(4) },
          ].map((m) => (
            <div key={m.label} className="rounded-xl bg-slate-50 dark:bg-white/5 p-4 text-center">
              <p className="text-xs text-slate-400 uppercase tracking-wide">{m.label}</p>
              <p className="font-display text-xl font-bold text-ink dark:text-white mt-1">{m.value}</p>
            </div>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
