/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      colors: {
        base: {
          950: "#080A0F",
          900: "#0B0F17",
          850: "#0F131C",
          800: "#131826",
          700: "#1A2131",
          600: "#232B3D",
          500: "#2E3750",
        },
        ink: {
          100: "#EDF0F7",
          300: "#B7C0D4",
          500: "#7C879E",
          700: "#525C72",
        },
        signal: {
          blue: "#3E7BFA",
          blueDim: "#2B4C8C",
          cyan: "#3DD9E8",
        },
        threat: {
          critical: "#F13F52",
          high: "#F7943B",
          medium: "#F0C542",
          low: "#3ECF8E",
        },
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(62,123,250,0.25), 0 8px 30px -8px rgba(62,123,250,0.35)",
        soft: "0 8px 24px -12px rgba(0,0,0,0.5)",
      },
      backgroundImage: {
        grid: "linear-gradient(to right, rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: 0, transform: "translateY(8px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        scan: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        pulseDot: {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.35 },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.5s ease-out both",
        scan: "scan 1.6s linear infinite",
        pulseDot: "pulseDot 1.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
