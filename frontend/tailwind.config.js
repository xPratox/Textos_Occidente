/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}",],
  theme: {
    extend: {
      colors: {
        navy: '#1e293b', // Azul naval
        navyLight: '#334155', // Azul naval claro para botones
        coldgray: '#f1f5f9', // Gris frío
        coldgrayDark: '#64748b', // Gris frío oscuro
      },
    },
  },
  plugins: [],
};
