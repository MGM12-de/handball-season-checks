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
  '@nuxt/eslint',
  '@nuxthub/core',
]

if (!isTest) {
  modulesList.push('@vite-pwa/nuxt')
}

export default defineNuxtConfig({
  compatibilityDate: '2026-02-06',
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
    cache: {
      driver: 'cloudflare-kv-binding',
      namespaceId: '622b3d207e21450db456b09ce3cf34c0',
    },
    db: {
      dialect: 'sqlite',
      driver: 'd1',
      connection: {
        databaseId: '29f5103a-ddac-4821-b783-060504afe479',
      },
    },
  },
  nitro: {
    preset: 'cloudflare_module',
    cloudflare: {
      deployConfig: true,
      nodeCompat: true,
    },
  },
  i18n,
  pwa,
})
