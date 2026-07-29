import React, { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  Cell,
  ScatterChart,
  Scatter,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { FiTarget, FiTrendingUp, FiBarChart2, FiActivity } from "react-icons/fi";

import { PageTransition } from "../components/PageShell.jsx";
import { SunSpinner } from "../components/Loaders.jsx";
import {
  getFeatureImportance,
  getCorrelation,
  getScatter,
  getHistogram,
  getModelInfo,
  getHistory,
} from "../services/api.js";

const BAR_COLORS = ["#FDB813", "#22C55E", "#2563EB", "#F59E0B", "#0EA5E9", "#84CC16", "#EAB308", "#38BDF8", "#A3E635", "#FACC15", "#60A5FA"];

function heatColor(v) {
  // v in [-1, 1] -> blue (negative) .. white (0) .. solar (positive)
  if (v >= 0) {
    const t = v; // 0..1
    const r = Math.round(255 - t * (255 - 253));
    const g = Math.round(255 - t * (255 - 184));
    const b = Math.round(255 - t * (255 - 19));
    return `rgb(${r},${g},${b})`;
  } else {
    const t = -v;
    const r = Math.round(255 - t * (255 - 37));
    const g = Math.round(255 - t * (255 - 99));
    const b = Math.round(255 - t * (255 - 235));
    return `rgb(${r},${g},${b})`;
  }
}

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [importance, setImportance] = useState([]);
  const [correlation, setCorrelation] = useState(null);
  const [scatter, setScatter] = useState([]);
  const [histogram, setHistogram] = useState([]);
  const [histColumn, setHistColumn] = useState("Solar_Irradiance");
  const [modelInfo, setModelInfo] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [fi, corr, sc, hist, info, hy] = await Promise.all([
          getFeatureImportance(),
          getCorrelation(),
          getScatter("Solar_Irradiance", "Solar_Power_Output"),
          getHistogram(histColumn),
          getModelInfo(),
          getHistory(),
        ]);
        setImportance(fi.data);
        setCorrelation(corr.data);
        setScatter(sc.data);
        setHistogram(hist.data);
        setModelInfo(info.data);
        setHistory(hy.data);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getHistogram(histColumn).then((res) => setHistogram(res.data));
  }, [histColumn]);

  const userPoint = history[0]
    ? { x: history[0].inputs.Solar_Irradiance, y: history[0].prediction }
    : null;

  const trendData = useMemo(
    () =>
      [...history]
        .slice(0, 20)
        .reverse()
        .map((h, i) => ({ name: `#${i + 1}`, prediction: h.prediction })),
    [history]
  );

  const histColumns = [
    "Solar_Irradiance",
    "Panel_Temperature",
    "Ambient_Temperature",
    "Cloud_Cover",
    "Humidity",
    "Wind_Speed",
    "Panel_Efficiency",
    "Inverter_Efficiency",
  ];

  if (loading) {
    return (
      <PageTransition>
        <div className="card"><SunSpinner size={48} label="Crunching analytics..." /></div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      {/* Model performance cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "R² Score", value: modelInfo.metrics.r2_score.toFixed(4), icon: FiTarget, accent: "solar" },
          { label: "MAE", value: modelInfo.metrics.mae.toFixed(4), icon: FiActivity, accent: "sky" },
          { label: "MSE", value: modelInfo.metrics.mse.toFixed(4), icon: FiBarChart2, accent: "leaf" },
          { label: "RMSE", value: modelInfo.metrics.rmse.toFixed(4), icon: FiTrendingUp, accent: "ink" },
        ].map((m) => (
          <div key={m.label} className="card p-5">
            <p className="section-label">{m.label}</p>
            <p className="mt-2 font-display text-2xl font-bold text-ink dark:text-white">{m.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature importance */}
        <div className="card p-5 sm:p-6">
          <p className="section-label">Explainability</p>
          <h3 className="font-display text-lg font-semibold text-ink dark:text-white mb-4">Feature Importance</h3>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={importance} layout="vertical" margin={{ left: 30 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="feature" type="category" width={130} tick={{ fontSize: 11 }} />
              <RTooltip formatter={(v) => v.toFixed(4)} />
              <Bar dataKey="importance" radius={[0, 6, 6, 0]}>
                {importance.map((entry, i) => (
                  <Cell key={entry.feature} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Correlation heatmap */}
        <div className="card p-5 sm:p-6 overflow-x-auto">
          <p className="section-label">Relationships</p>
          <h3 className="font-display text-lg font-semibold text-ink dark:text-white mb-4">Correlation Heatmap</h3>
          {correlation && (
            <div className="min-w-[560px]">
              <div
                className="grid gap-[2px]"
                style={{ gridTemplateColumns: `120px repeat(${correlation.columns.length}, 1fr)` }}
              >
                <div />
                {correlation.columns.map((c) => (
                  <div key={c} className="text-[9px] text-slate-400 text-center rotate-45 origin-bottom-left h-16 flex items-end justify-center">
                    {c}
                  </div>
                ))}
                {correlation.matrix.map((row, i) => (
                  <React.Fragment key={correlation.columns[i]}>
                    <div className="text-[10px] text-slate-500 flex items-center pr-2 truncate">
                      {correlation.columns[i]}
                    </div>
                    {row.map((v, j) => (
                      <div
                        key={j}
                        title={`${correlation.columns[i]} vs ${correlation.columns[j]}: ${v}`}
                        className="aspect-square flex items-center justify-center text-[8px] font-mono rounded-sm"
                        style={{ backgroundColor: heatColor(v), color: Math.abs(v) > 0.6 ? "#0B1220" : "#334155" }}
                      >
                        {v.toFixed(1)}
                      </div>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Scatter plot */}
        <div className="card p-5 sm:p-6">
          <p className="section-label">Distribution</p>
          <h3 className="font-display text-lg font-semibold text-ink dark:text-white mb-4">
            Solar Irradiance vs Solar Power Output
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid stroke="#E2E8F0" />
              <XAxis dataKey="x" name="Solar Irradiance" unit=" W/m²" tick={{ fontSize: 11 }} />
              <YAxis dataKey="y" name="Solar Power Output" unit=" kWh" tick={{ fontSize: 11 }} />
              <RTooltip cursor={{ strokeDasharray: "3 3" }} />
              <Scatter data={scatter} fill="#2563EB" opacity={0.45} />
              {userPoint && <Scatter data={[userPoint]} fill="#EF4444" shape="star" />}
            </ScatterChart>
          </ResponsiveContainer>
          {userPoint && (
            <p className="text-xs text-slate-400 mt-2">
              ★ Red star marks your most recent prediction.
            </p>
          )}
        </div>

        {/* Histogram */}
        <div className="card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="section-label">Distribution</p>
              <h3 className="font-display text-lg font-semibold text-ink dark:text-white">Feature Histogram</h3>
            </div>
            <select
              value={histColumn}
              onChange={(e) => setHistColumn(e.target.value)}
              className="input-field !w-auto text-sm py-1.5"
            >
              {histColumns.map((c) => (
                <option key={c} value={c}>
                  {c.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={histogram}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="bin" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <RTooltip />
              <Bar dataKey="count" fill="#FDB813" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Prediction trend */}
      <div className="card p-5 sm:p-6">
        <p className="section-label">Session History</p>
        <h3 className="font-display text-lg font-semibold text-ink dark:text-white mb-4">Prediction Trend</h3>
        {trendData.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <RTooltip />
              <Legend />
              <Line type="monotone" dataKey="prediction" stroke="#22C55E" strokeWidth={2.5} dot={{ r: 3 }} name="Predicted Output (kWh)" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center py-16 text-sm text-slate-400">
            Generate a few predictions to see your trend here.
          </p>
        )}
      </div>
    </PageTransition>
  );
}
