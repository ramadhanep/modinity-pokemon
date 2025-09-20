// tailwind.config.ts
import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f0fbfe',
          100: '#ddf7fd',
          200: '#bbeefb',
          300: '#81e0f8',
          400: '#33d5ff',
          500: '#00c7fa',
          600: '#009ec7',
          700: '#007897',
          800: '#00617a',
          900: '#003d4c',
          950: '#002933',
        },
      },
    },
  },
}
