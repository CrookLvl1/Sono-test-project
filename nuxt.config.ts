// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // devtools: { enabled: true },
  app: {
    baseURL: '/Sono-test-project/',
    buildAssetsDir: 'assets',
  },
  modules: ['@pinia/nuxt'],
  pinia: {
    storesDirs: ['./store/**'],
  },
  css: ['@/assets/scss/main.scss'],
})
