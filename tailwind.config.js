/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        surface: "#F8FAFC",
        solar: {
          DEFAULT: "#FDB813",
          50: "#FFF8E6",
          100: "#FFEFC2",
          200: "#FFE39B",
          300: "#FED36A",
          400: "#FDC53F",
          500: "#FDB813",
          600: "#E5A30A",
          700: "#B87F06",
        },
        leaf: {
          DEFAULT: "#22C55E",
          50: "#EAFBF1",
          200: "#BBF0D2",
          400: "#4ADE80",
          500: "#22C55E",
          600: "#16A34A",
        },
        sky: {
          DEFAULT: "#2563EB",
          50: "#EAF1FE",
          200: "#BFD4FC",
          400: "#5B8DEF",
          500: "#2563EB",
          600: "#1D4ED8",
        },
        ink: "#1F2937",
        navy: {
          DEFAULT: "#0B1220",
          800: "#111A2E",
          900: "#0B1220",
        },
      },
      fontFamily: {
        display: ["Sora", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        premium: "0 20px 45px -15px rgba(15, 23, 42, 0.15)",
        card: "0 8px 24px -8px rgba(15, 23, 42, 0.10)",
        glow: "0 0 0 1px rgba(253,184,19,0.15), 0 12px 30px -8px rgba(253,184,19,0.35)",
      },
      backgroundImage: {
        "sun-radial": "radial-gradient(circle at 30% 20%, #FFE8A3 0%, #FDB813 45%, #E5A30A 100%)",
        "dusk-navy": "linear-gradient(180deg, #0B1220 0%, #111A2E 100%)",
      },
      keyframes: {
        "spin-slow": { to: { transform: "rotate(360deg)" } },
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.6" },
          "70%": { transform: "scale(1.6)", opacity: "0" },
          "100%": { opacity: "0" },
        },
        rise: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "spin-slow": "spin-slow 14s linear infinite",
        "pulse-ring": "pulse-ring 2.4s cubic-bezier(0.4,0,0.6,1) infinite",
        rise: "rise 0.5s ease-out both",
      },
    },
  },
  plugins: [],
};
