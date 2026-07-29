import React from "react";
import { NavLink } from "react-router-dom";
import {
  FiHome,
  FiZap,
  FiBarChart2,
  FiClock,
  FiCpu,
  FiSettings,
  FiSun,
} from "react-icons/fi";
import Logo from "./Logo.jsx";

const links = [
  { to: "/", label: "Dashboard", icon: FiHome, end: true },
  { to: "/prediction", label: "Prediction", icon: FiZap },
  { to: "/analytics", label: "Analytics", icon: FiBarChart2 },
  { to: "/history", label: "Prediction History", icon: FiClock },
  { to: "/ai-model", label: "AI Model", icon: FiCpu },
  { to: "/settings", label: "Settings", icon: FiSettings },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed z-40 lg:z-10 top-0 left-0 h-full w-64 bg-dusk-navy text-slate-200 flex flex-col
        transition-transform duration-300 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="px-6 py-6 border-b border-white/10">
          <Logo dark />
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200
                ${isActive ? "bg-white/10 text-solar-400 shadow-inner" : "text-slate-300 hover:bg-white/5 hover:text-white"}`
              }
            >
              <Icon size={18} className="shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-6 py-5 border-t border-white/10">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <FiSun className="text-solar-400" />
            <span>Renewable-first, AI-driven.</span>
          </div>
        </div>
      </aside>
    </>
  );
}
