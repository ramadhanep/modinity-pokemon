// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@nuxt/icon'],
  runtimeConfig: {
    public: {
      apiBase: process.env.MODINITY_POKEMON_API_BASE || 'http://localhost:3001/api',
      pokeBase: 'https://pokeapi.co/api/v2',
      siteName: 'Modinity Pokemon',
      githubUrl: 'https://github.com/ramadhanep/modinity-pokemon'
    }
  },
})