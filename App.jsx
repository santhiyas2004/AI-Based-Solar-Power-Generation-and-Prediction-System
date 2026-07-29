import React, { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import Sidebar from "./components/Sidebar.jsx";
import Topbar from "./components/Topbar.jsx";
import { Footer } from "./components/PageShell.jsx";
import { ThemeProvider } from "./hooks/useTheme.jsx";
import { ToastProvider } from "./hooks/useToast.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import Prediction from "./pages/Prediction.jsx";
import Analytics from "./pages/Analytics.jsx";
import History from "./pages/History.jsx";
import AIModel from "./pages/AIModel.jsx";
import Settings from "./pages/Settings.jsx";
import NotFound from "./pages/NotFound.jsx";

const TITLES = {
  "/": { title: "Dashboard", subtitle: "Live overview of your solar prediction system" },
  "/prediction": { title: "Prediction", subtitle: "Generate an instant AI-powered output forecast" },
  "/analytics": { title: "Analytics", subtitle: "Model behaviour and dataset insight" },
  "/history": { title: "Prediction History", subtitle: "Every forecast you've generated" },
  "/ai-model": { title: "AI Model", subtitle: "Under the hood of the Random Forest engine" },
  "/settings": { title: "Settings", subtitle: "Personalize your workspace" },
};

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const meta = TITLES[location.pathname] || { title: "Sunlytics", subtitle: "" };

  return (
    <div className="min-h-screen bg-surface dark:bg-navy-900 transition-colors duration-300">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Topbar onMenuClick={() => setSidebarOpen(true)} title={meta.title} subtitle={meta.subtitle} />
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/prediction" element={<Prediction />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/history" element={<History />} />
              <Route path="/ai-model" element={<AIModel />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Layout />
      </ToastProvider>
    </ThemeProvider>
  );
}
