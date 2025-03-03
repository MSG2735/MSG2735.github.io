/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          start: "rgb(var(--background-start-rgb))",
          end: "rgb(var(--background-end-rgb))",
        },
        foreground: "rgb(var(--foreground-rgb))",
      },
    },
  },
  plugins: [],
}; 