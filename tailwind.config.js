/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        kid: ['"Varela Round"', '"Rubik"', "system-ui", "sans-serif"]
      },
      colors: {
        leaf: {
          light: "#dcfce7",
          DEFAULT: "#16a34a",
          dark: "#15803d"
        },
        sun: "#facc15",
        sky: "#38bdf8"
      },
      borderRadius: {
        blob: "2rem"
      },
      keyframes: {
        pop: {
          "0%": { transform: "scale(0.6)", opacity: "0" },
          "70%": { transform: "scale(1.1)", opacity: "1" },
          "100%": { transform: "scale(1)" }
        },
        wiggle: {
          "0%,100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" }
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" }
        },
        grow: {
          "0%": { transform: "scaleY(0.2)", transformOrigin: "bottom", opacity: "0.3" },
          "100%": { transform: "scaleY(1)", transformOrigin: "bottom", opacity: "1" }
        }
      },
      animation: {
        pop: "pop 0.4s ease-out",
        wiggle: "wiggle 0.6s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
        grow: "grow 1.2s ease-in-out infinite alternate"
      }
    }
  },
  plugins: []
};
