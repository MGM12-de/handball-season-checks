// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  extends: [],
  modules: [
    '@nuxt/content',
    '@nuxt/ui-pro',
    '@nuxtjs/i18n',
    '@nuxt/image',
    '@scalar/nuxt',
    '@nuxt/eslint',
    '@nuxthub/core',
  ],
  css: ['~/assets/css/main.css'],
  future: {
    compatibilityVersion: 4,
  },
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
    },
  },
  hub: {
  },
  nitro: {
    experimental: {
      openAPI: true,
    },
  },
  i18n: {
    locales: [{ code: 'en', name: 'English' }, { code: 'de', name: 'Deutsch' }],
  },
})
