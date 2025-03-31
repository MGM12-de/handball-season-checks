import { pwa } from './config/pwa'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  extends: [],
  modules: ['@nuxt/content', '@nuxt/ui-pro', '@nuxtjs/i18n', '@nuxt/image', '@scalar/nuxt', '@nuxt/eslint', '@nuxthub/core', '@vite-pwa/nuxt'],
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
  imports: {
    autoImport: true,
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
    locales: [{ code: 'en', name: 'English', language: 'en-US', file: 'en-US.json' }, { code: 'de', name: 'Deutsch', language: 'de-DE', file: 'de-DE.json' }],
    lazy: true,
    langDir: './locales',
    detectBrowserLanguage: {
      useCookie: true,
      cookieCrossOrigin: true,
    },
  },
  pwa,
})
