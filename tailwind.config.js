module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}', // Adjust according to your folder structure
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        // Other custom colors go here
        border: 'hsl(var(--border))',
      },
      borderColor: {
        border: 'hsl(var(--border))', // Custom border color
      },
      ringColor: {
        ring: 'hsl(var(--ring))', // Custom ring color
      },
      borderRadius: {
        DEFAULT: 'var(--radius)', // Custom border radius
      },
    },
  },
  darkMode: 'class', // Ensure that dark mode uses the .dark class
  plugins: [],
}
