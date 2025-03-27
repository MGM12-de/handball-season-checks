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
    strategy: 'no_prefix',
    defaultLocale: 'en',
    baseUrl: 'https://handball-checks.mgm12.dev',
    locales: [{ code: 'en', name: 'English', language: 'en-US' }, { code: 'de', name: 'Deutsch', language: 'de-DE' }],
    vueI18n: './i18n.config.ts',
    detectBrowserLanguage: {
      useCookie: true,
      cookieCrossOrigin: true,
    },
  },
})
