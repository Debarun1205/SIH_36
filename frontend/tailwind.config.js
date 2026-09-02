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
        paper: "#F6F4EF",     // warm paper background, not the AI-cliche cream+terracotta
        paperdim: "#EDEAE1",
        line: "#D8D2C4",
        ok: "#3F6B4A",
        warn: "#A6631E",
        danger: "#9B3B3B",
      },
      fontFamily: {
        serif: ["'Source Serif 4'", "serif"],
        sans: ["'IBM Plex Sans'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
