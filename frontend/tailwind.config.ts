import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        accent: "#d9ff57",
        ink: "#121510",
      },
    },
  },
  plugins: [],
};

export default config;
