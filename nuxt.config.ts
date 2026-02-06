import { i18n, pwa } from './config/config'

// https://nuxt.com/docs/api/configuration/nuxt-config
const isTest = process.env.VITEST === 'true' || process.env.NODE_ENV === 'test'

// Always include test-utils; exclude PWA during tests to avoid virtual module issues
const modulesList = [
  '@nuxt/test-utils/module',
  '@nuxt/content',
  '@nuxt/ui',
  '@nuxtjs/i18n',
  '@nuxt/image',
  '@scalar/nuxt',
  '@nuxt/eslint',
  '@nuxthub/core',
]

if (!isTest) {
  modulesList.push('@vite-pwa/nuxt')
}

export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  extends: [],
  modules: modulesList,
  css: ['~/assets/css/main.css'],
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
    cache: true,
  },
  nitro: {
    experimental: {
      openAPI: true,
    },
  },
  i18n,
  pwa,
})
