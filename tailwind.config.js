export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ocean: {
          deep:  '#071828',
          mid:   '#0f2e4a',
          bright:'#0c7ca8',
        },
        turquoise: '#06b6d4',
        sand:      '#f0debb',
        coral:     '#e07a5f',
        cream:     '#faf8f3',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        body:    ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
