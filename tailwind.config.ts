import type { Config } from "tailwindcss";

/**
 * Alpine Growth System — tokens transcribed from DESIGN.md.
 * Material-style surface roles + the seven competency hues (spec §9).
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}", "./spa/**/*.{ts,tsx,html}"],
  theme: {
    extend: {
      colors: {
        // Surface / role tokens (DESIGN.md)
        surface: {
          DEFAULT: "#fbf8ff",
          dim: "#d5d8f9",
          bright: "#fbf8ff",
          "container-lowest": "#ffffff",
          "container-low": "#f4f2ff",
          container: "#ececff",
          "container-high": "#e5e6ff",
          "container-highest": "#dee0ff",
          variant: "#dee0ff",
        },
        "on-surface": "#161a32",
        "on-surface-variant": "#4b4451",
        "inverse-surface": "#2b2f48",
        "inverse-on-surface": "#f0efff",
        outline: "#7c7482",
        "outline-variant": "#cdc3d2",
        primary: {
          DEFAULT: "#7047a4",
          container: "#8961bf",
          fixed: "#eedcff",
          "fixed-dim": "#d8b9ff",
        },
        "on-primary": "#ffffff",
        "on-primary-container": "#fffbff",
        "inverse-primary": "#d8b9ff",
        secondary: {
          DEFAULT: "#006a65",
          container: "#79f3ea",
        },
        "on-secondary": "#ffffff",
        "on-secondary-container": "#006f69",
        tertiary: {
          DEFAULT: "#676000",
          container: "#b9ae3a",
        },
        "on-tertiary": "#ffffff",
        error: {
          DEFAULT: "#ba1a1a",
          container: "#ffdad6",
        },
        "on-error": "#ffffff",
        "on-error-container": "#93000a",
        background: "#fbf8ff",
        "on-background": "#161a32",

        // Seven competency hues (spec §9) — soft, readable.
        competency: {
          communication: "#2f6df0", // blue
          leadership: "#f08a24", // orange
          emotional: "#16a06a", // green
          thinking: "#8b4fd1", // purple
          creativity: "#e8b321", // yellow
          independence: "#1fb6c9", // turquoise / light blue
          teamwork: "#f0584f", // red / coral
        },
      },
      fontFamily: {
        head: ["var(--font-outfit)", "Outfit", "system-ui", "sans-serif"],
        body: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        "headline-xl": ["48px", { lineHeight: "56px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-lg": ["32px", { lineHeight: "40px", fontWeight: "700" }],
        "headline-lg-mobile": ["28px", { lineHeight: "36px", fontWeight: "700" }],
        "headline-md": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "28px" }],
        "body-md": ["16px", { lineHeight: "24px" }],
        "label-bold": ["14px", { lineHeight: "20px", fontWeight: "600" }],
      },
      borderRadius: {
        sm: "0.5rem",
        DEFAULT: "1rem",
        md: "1.5rem",
        lg: "2rem",
        xl: "3rem",
        full: "9999px",
      },
      spacing: {
        gutter: "24px",
        "stack-sm": "12px",
        "stack-md": "24px",
        "stack-lg": "48px",
        "container-mobile": "20px",
        "container-desktop": "40px",
      },
      maxWidth: {
        content: "1100px",
        form: "640px",
      },
      boxShadow: {
        ambient: "0px 10px 30px rgba(0,0,0,0.05)",
        "ambient-lg": "0px 18px 50px rgba(22,26,50,0.10)",
        glow: "0 0 0 4px rgba(112,71,164,0.12)",
      },
      backdropBlur: {
        glass: "12px",
      },
      keyframes: {
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(0.96) translateY(8px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.04)" },
        },
      },
      animation: {
        "pop-in": "pop-in 0.35s cubic-bezier(0.22,1,0.36,1)",
        "pulse-soft": "pulse-soft 0.6s ease-in-out",
      },
    },
  },
  plugins: [],
};

export default config;
