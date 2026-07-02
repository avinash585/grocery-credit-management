import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        leaf: {
          50: "#edfdf3",
          100: "#d4f8e1",
          600: "#138a4b",
          700: "#0d6f3d",
          900: "#073d25"
        },
        ink: "#17201a",
        millet: "#f7d46f",
        chilli: "#cf3f2e"
      },
      boxShadow: {
        soft: "0 12px 30px rgba(23, 32, 26, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;

