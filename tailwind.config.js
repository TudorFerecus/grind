/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        warmMaker: {
          "primary": "#d4845a",    /* Original soft terracotta/copper */
          "primary-content": "#1a1410",
          "secondary": "#a89880",  /* Muted text color for secondary elements */
          "accent": "#c9a84c",     /* Original dull gold */
          "accent-content": "#1a1410",
          "neutral": "#241e17",    /* Elevated brownish black */
          "base-100": "#1a1410",   /* Original deep brownish black background */
          "base-200": "#241e17",   /* Original elevated */
          "base-300": "#352d23",   /* Original surface */
          "base-content": "#f0e6d6", /* Original creamy off-white text */
          "info": "#3b82f6",
          "success": "#7cb87a",    /* Original success green */
          "warning": "#f59e0b",
          "error": "#d9534f",      /* Original error red */

          
          "--rounded-box": "0.5rem",
          "--rounded-btn": "0.3rem",
          "--rounded-badge": "1.9rem",
        },
      },
    ],
    darkTheme: "warmMaker",
  },
}
