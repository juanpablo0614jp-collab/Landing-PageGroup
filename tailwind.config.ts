import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: "#0B1D3A", light: "#132B50" },
        accent: { DEFAULT: "#00C48C", dark: "#00A676", pale: "#E6FBF3" },
      },
    },
  },
  plugins: [],
};
export default config;
