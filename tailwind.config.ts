import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...fontFamily.sans],
      },
      colors: {
        primary: "#3acaff",
        secondary: "#35c0f6",
        hover: "#30b0e3",
      },
    },
  },
  plugins: [],
} satisfies Config;
