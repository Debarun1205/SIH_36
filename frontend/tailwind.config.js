/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1F2A44",       // deep official navy
        inkdeep: "#141C30",
        brass: "#B8863B",     // certification/seal accent
        brasslight: "#D9AE6E",
        maroon: "#7A2E2E",    // oxblood accent - seals/stamps, used sparingly
        paper: "#F6F4EF",     // warm paper background, not the AI-cliche cream+terracotta
        paperdim: "#EDEAE1",
        paperwarm: "#F1EADD", // slightly warmer card tone for layered sections
        line: "#D8D2C4",
        ok: "#3F6B4A",
        warn: "#A6631E",
        danger: "#9B3B3B",
      },
      fontFamily: {
        serif: ["'Fraunces'", "serif"],
        sans: ["'IBM Plex Sans'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(20,28,48,0.04), 0 4px 16px rgba(20,28,48,0.05)",
        lift: "0 8px 24px rgba(20,28,48,0.1)",
      },
    },
  },
  plugins: [],
};
