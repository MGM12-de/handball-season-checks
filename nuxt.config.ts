import { hub, i18n, pwa } from './config/config'

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
  routeRules: {
    '/': { prerender: true },
  },
  hub,
  nitro: {
    preset: 'cloudflare_module',
    cloudflare: {
      deployConfig: true,
      nodeCompat: true,
    },
  },
  i18n,
  pwa,
  runtimeConfig: {
    public: {
      dhbBaseUrl: process.env.DHB_BASE_URL || 'https://www.handball.net/a/sportdata/1',
    },
  },
  routeRules: {
    // 1. Spezifische Regeln: Vereinsdaten ändern sich selten (z. B. 1 Tag Cache)
    '/api/dhb/club/**': {
      swr: 60 * 60 * 24,
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
      },
    },

    // 2. Spezifische Regeln: Turniere/Ligen (z. B. 15 Minuten Cache)
    '/api/dhb/tournament/**': {
      swr: 60 * 15,
      headers: {
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=60',
      },
    },

    // 3. Spezifische Regeln: Spiele und Tabellenplätze (sehr aktuell, z. B. 5 Minuten)
    '/api/dhb/team/games': {
      swr: 60 * 5,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
      },
    },
    '/api/dhb/team/standing': {
      swr: 60 * 5,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
      },
    },

    // 4. Live-Daten: Aktuelles Spiel (kein Cache, immer live)
    '/api/dhb/game/**': {
      cache: false, // Explizit Caching deaktivieren
    },
  },
})
