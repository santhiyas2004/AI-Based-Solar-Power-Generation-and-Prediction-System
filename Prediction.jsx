import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiZap, FiDownload, FiRefreshCw } from "react-icons/fi";
import jsPDF from "jspdf";

import { PageTransition } from "../components/PageShell.jsx";
import FormField from "../components/FormField.jsx";
import { SunSpinner } from "../components/Loaders.jsx";
import { useToast } from "../hooks/useToast.jsx";
import { predict } from "../services/api.js";

// field config: label, unit, tooltip, bounds derived from the training dataset
const FIELDS = [
  {
    key: "Solar_Irradiance",
    label: "Solar Irradiance",
    unit: "W/m²",
    tooltip: "Amount of solar energy hitting the panel surface.",
    placeholder: "e.g. 650",
    min: 0,
    max: 1200,
  },
  {
    key: "Panel_Temperature",
    label: "Panel Temperature",
    unit: "°C",
    tooltip: "Surface temperature of the solar panel.",
    placeholder: "e.g. 35",
    min: 0,
    max: 70,
  },
  {
    key: "Ambient_Temperature",
    label: "Ambient Temperature",
    unit: "°C",
    tooltip: "Surrounding air temperature.",
    placeholder: "e.g. 28",
    min: -10,
    max: 55,
  },
  {
    key: "Cloud_Cover",
    label: "Cloud Cover",
    unit: "%",
    tooltip: "Percentage of sky covered by clouds.",
    placeholder: "e.g. 20",
    min: 0,
    max: 100,
  },
  {
    key: "Humidity",
    label: "Humidity",
    unit: "%",
    tooltip: "Relative humidity of the air.",
    placeholder: "e.g. 55",
    min: 0,
    max: 100,
  },
  {
    key: "Wind_Speed",
    label: "Wind Speed",
    unit: "m/s",
    tooltip: "Speed of wind near the installation site.",
    placeholder: "e.g. 4",
    min: 0,
    max: 25,
  },
  {
    key: "Rainfall",
    label: "Rainfall",
    unit: "mm",
    tooltip: "Recent rainfall amount, reduces panel output.",
    placeholder: "e.g. 0",
    min: 0,
    max: 50,
  },
  {
    key: "Dust_Level",
    label: "Dust Level",
    unit: "index",
    tooltip: "Accumulated dust/soiling on the panel surface (0-30 index).",
    placeholder: "e.g. 15",
    min: 0,
    max: 30,
  },
  {
    key: "Panel_Efficiency",
    label: "Panel Efficiency",
    unit: "%",
    tooltip: "Rated conversion efficiency of the solar panel.",
    placeholder: "e.g. 20",
    min: 10,
    max: 25,
  },
  {
    key: "Inverter_Efficiency",
    label: "Inverter Efficiency",
    unit: "%",
    tooltip: "Efficiency of the inverter converting DC to AC.",
    placeholder: "e.g. 96",
    min: 85,
    max: 100,
  },
  {
    key: "Hour",
    label: "Hour of Day",
    unit: "0-23",
    tooltip: "Hour of the day (24h) the reading was taken — the model uses this to capture daily solar cycles.",
    placeholder: "e.g. 13",
    min: 0,
    max: 23,
  },
];

const initialState = FIELDS.reduce((acc, f) => ({ ...acc, [f.key]: "" }), {});

function qualityStyles(quality) {
  switch (quality) {
    case "Excellent":
      return "bg-leaf-50 text-leaf-600 dark:bg-leaf-500/10 dark:text-leaf-400 border-leaf-200";
    case "Good":
      return "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400 border-sky-200";
    case "Average":
      return "bg-solar-50 text-solar-700 dark:bg-solar-500/10 dark:text-solar-400 border-solar-200";
    default:
      return "bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300 border-slate-200";
  }
}

export default function Prediction() {
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { showToast } = useToast();

  const handleChange = (key) => (e) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    setErrors((err) => ({ ...err, [key]: undefined }));
  };

  const validate = () => {
    const newErrors = {};
    FIELDS.forEach((f) => {
      const raw = values[f.key];
      if (raw === "" || raw === null) {
        newErrors[f.key] = "Required";
        return;
      }
      const num = Number(raw);
      if (Number.isNaN(num)) {
        newErrors[f.key] = "Must be a number";
      } else if (num < f.min || num > f.max) {
        newErrors[f.key] = `Range ${f.min}–${f.max}`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    if (!validate()) {
      showToast("Please fix the highlighted fields", "error");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const payload = Object.fromEntries(FIELDS.map((f) => [f.key, Number(values[f.key])]));
      const res = await predict(payload);
      setResult({ ...res.data, inputs: payload });
      showToast("Prediction generated successfully", "success");
    } catch (err) {
      showToast(err?.response?.data?.error || "Prediction failed. Is the backend running?", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setValues(initialState);
    setErrors({});
    setResult(null);
  };

  const downloadReport = () => {
    if (!result) return;
    const doc = new jsPDF();
    const now = new Date();

    doc.setFillColor(11, 18, 32);
    doc.rect(0, 0, 210, 30, "F");
    doc.setTextColor(253, 184, 19);
    doc.setFontSize(20);
    doc.text("Sunlytics", 14, 18);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text("AI Powered Solar Power Prediction Report", 14, 25);

    doc.setTextColor(31, 41, 55);
    doc.setFontSize(11);
    let y = 42;
    doc.text(`Date: ${now.toLocaleDateString()}`, 14, y);
    doc.text(`Time: ${now.toLocaleTimeString()}`, 110, y);
    y += 8;
    doc.text(`Model: Random Forest Regression`, 14, y);
    y += 8;
    doc.text(`Model Accuracy (R2): 95.59%`, 14, y);

    y += 12;
    doc.setFontSize(13);
    doc.setTextColor(253, 184, 19);
    doc.text("Predicted Solar Power Output", 14, y);
    doc.setFontSize(22);
    doc.setTextColor(34, 197, 94);
    y += 10;
    doc.text(`${result.prediction} kWh`, 14, y);
    doc.setFontSize(11);
    doc.setTextColor(31, 41, 55);
    doc.text(`Quality: ${result.quality}`, 14, y + 8);

    y += 20;
    doc.setFontSize(13);
    doc.setTextColor(37, 99, 235);
    doc.text("Input Parameters", 14, y);
    y += 8;
    doc.setFontSize(10);
    doc.setTextColor(31, 41, 55);
    FIELDS.forEach((f) => {
      doc.text(`${f.label}: ${result.inputs[f.key]} ${f.unit || ""}`, 14, y);
      y += 6;
    });

    doc.save(`Sunlytics_Report_${now.getTime()}.pdf`);
    showToast("Report downloaded", "success");
  };

  return (
    <PageTransition>
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Form */}
        <form onSubmit={handlePredict} className="card p-6 xl:col-span-3 space-y-6">
          <div>
            <p className="section-label">AI Prediction</p>
            <h3 className="font-display text-xl font-semibold text-ink dark:text-white">
              Enter site &amp; weather conditions
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              All fields are used by the trained Random Forest model, in the exact order it was trained on.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5">
            {FIELDS.map((f) => (
              <FormField
                key={f.key}
                label={f.label}
                unit={f.unit}
                tooltip={f.tooltip}
                placeholder={f.placeholder}
                min={f.min}
                max={f.max}
                value={values[f.key]}
                error={errors[f.key]}
                onChange={handleChange(f.key)}
              />
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? (
                <>
                  <FiRefreshCw className="animate-spin" /> Predicting...
                </>
              ) : (
                <>
                  <FiZap /> Predict
                </>
              )}
            </button>
            <button type="button" onClick={handleReset} className="btn-secondary">
              Reset
            </button>
          </div>
        </form>

        {/* Result */}
        <div className="xl:col-span-2">
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div key="loading" className="card p-6 h-full flex items-center justify-center">
                <SunSpinner size={48} label="Running Random Forest inference..." />
              </motion.div>
            )}

            {!loading && result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="card-glass p-6 sticky top-24"
              >
                <p className="section-label">Result</p>
                <h3 className="font-display text-lg font-semibold text-ink dark:text-white mb-4">
                  Predicted Solar Power Output
                </h3>

                <div className="rounded-2xl bg-sun-radial p-6 text-center shadow-glow">
                  <p className="font-display text-4xl font-extrabold text-navy-900">
                    {result.prediction}
                  </p>
                  <p className="font-mono text-sm text-navy-900/70 mt-1">kWh</p>
                </div>

                <div className={`mt-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold ${qualityStyles(result.quality)}`}>
                  Prediction Quality: {result.quality}
                </div>

                <button onClick={downloadReport} className="btn-secondary w-full mt-6">
                  <FiDownload /> Download PDF Report
                </button>
              </motion.div>
            )}

            {!loading && !result && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="card p-10 h-full flex flex-col items-center justify-center text-center gap-3"
              >
                <div className="w-16 h-16 rounded-full bg-solar-50 dark:bg-solar-500/10 flex items-center justify-center">
                  <FiZap className="text-solar-500" size={26} />
                </div>
                <p className="font-display font-semibold text-ink dark:text-white">Ready when you are</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
                  Fill in the conditions on the left and click Predict to get an instant AI-powered forecast.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
}
