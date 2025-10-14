import type { Config } from "tailwindcss";

import { BREAKPOINTS } from "./constants";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./utils/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: BREAKPOINTS,
    extend: {},
  },
  plugins: [],
};
export default config;
