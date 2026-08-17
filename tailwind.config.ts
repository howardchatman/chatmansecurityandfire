import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 2026 rebrand — navy shield, sky blue, crimson. The whole codebase
        // was written against Tailwind's `orange` scale (1,600+ usages), so
        // rather than touch every file, `orange` itself is remapped to the
        // brand red ramp below. Writing bg-orange-600 now paints brand red;
        // the class names are legacy, the colors are current.
        orange: {
          50: "#FCF3F4",
          100: "#F9E4E6",
          200: "#F2C6CA",
          300: "#E89AA1",
          400: "#DB646F",
          500: "#D03D4B",
          600: "#C42332", // primary CTA — the logo's crimson
          700: "#A21C29",
          800: "#861821",
          900: "#70161D",
          950: "#3E0B10",
          DEFAULT: "#C42332",
        },
        brand: {
          navy: "#0E2148", // the logo's shield-background navy
          blue: "#5B9CD6", // the logo's sky blue
          red: "#C42332",
        },
        primary: {
          50: "#FCF3F4",
          100: "#F9E4E6",
          200: "#F2C6CA",
          300: "#E89AA1",
          400: "#DB646F",
          500: "#D03D4B",
          600: "#C42332",
          700: "#A21C29",
          800: "#861821",
          900: "#70161D",
          DEFAULT: "#C42332",
        },
        secondary: {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
          950: "#030712",
          DEFAULT: "#6b7280",  // Gray from logo
        },
        accent: {
          50: "#F2F7FC",
          100: "#E3EEF8",
          200: "#C5DCF0",
          300: "#9FC6E6",
          400: "#7BB0DD",
          500: "#5B9CD6", // the logo's sky blue
          600: "#3F82C2",
          700: "#30689D",
          800: "#295680",
          900: "#244864",
          DEFAULT: "#5B9CD6",
        },
        success: {
          DEFAULT: "#10b981",
          light: "#34d399",
          dark: "#059669",
        },
        warning: {
          DEFAULT: "#f59e0b",
          light: "#fbbf24",
          dark: "#d97706",
        },
        danger: {
          DEFAULT: "#ef4444",
          light: "#f87171",
          dark: "#dc2626",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        gradient: "gradient 8s ease infinite",
        shimmer: "shimmer 2s linear infinite",
        "bounce-slow": "bounce 3s infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        gradient: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
} satisfies Config;
