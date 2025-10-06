/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Brand colors
        primary: {
          DEFAULT: "#0066cc",
          dark: "#3b82f6",
          darker: "#1e40af",
        },
        secondary: {
          DEFAULT: "#64748b",
          dark: "#475569",
        },
        // Background colors
        background: {
          light: "#ffffff",
          dark: "#111827",
          card: {
            light: "#f8fafc",
            dark: "#1f2937",
          },
        },
        // Text colors
        text: {
          primary: {
            light: "#1f2937",
            dark: "#f3f4f6",
          },
          secondary: {
            light: "#64748b",
            dark: "#9ca3af",
          },
          muted: {
            light: "#6b7280",
            dark: "#9ca3af",
          },
        },
        // Border colors
        border: {
          light: "#e5e7eb",
          dark: "#374151",
        },
        // Card & Component colors
        card: {
          light: "#ffffff",
          dark: "#1f2937",
        },
        // Success, warning, error colors that work in both modes
        success: {
          light: "#22c55e",
          dark: "#4ade80",
        },
        warning: {
          light: "#f59e0b",
          dark: "#fbbf24",
        },
        error: {
          light: "#ef4444",
          dark: "#f87171",
        },
      },
      // Add box shadow variations
      boxShadow: {
        "card-light":
          "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        "card-dark":
          "0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2)",
      },
    },
  },
  plugins: [],
};
