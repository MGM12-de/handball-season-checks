// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  extends: ['@nuxt/ui-pro'],
  modules: ["@scalar/nuxt", '@nuxt/content', '@nuxt/ui', "@nuxt/image"],
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
    }
  },
  nitro: {
    experimental: {
      openAPI: true,
    },
  },
  ui: {
    icons: ['mdi', 'simple-icons']
  },
})