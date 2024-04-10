// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  extends: ['@nuxt/ui-pro'],
  modules: ['@nuxt/content', '@nuxt/ui', "@nuxt/image"],
  ui: {
    icons: ['mdi', 'simple-icons']
  },
  routeRules: {
    '/api/dhb/searchClub': { prerender: true}
  }
})
