import { hub, i18n, pwa } from './config/config'

// https://nuxt.com/docs/api/configuration/nuxt-config
const isTest = process.env.VITEST === 'true' || process.env.NODE_ENV === 'test'
const isProd = process.env.NODE_ENV === 'production'
const isDev = !isProd

function envFlag(value: string | undefined, fallback: boolean) {
  if (value === undefined)
    return fallback
  return value === 'true'
}

const enablePwa = envFlag(process.env.NUXT_ENABLE_PWA, isProd && !isTest)
const enableHub = envFlag(process.env.NUXT_ENABLE_HUB, isProd)

// Always include test-utils; exclude PWA during tests to avoid virtual module issues
const modulesList = [
  '@nuxt/content',
  '@nuxt/ui',
  '@nuxtjs/i18n',
  '@nuxt/image',
]

if (isTest) {
  modulesList.push('@nuxt/test-utils/module')
}

if (isDev) {
  modulesList.push('@nuxt/eslint')
}

if (enableHub) {
  modulesList.push('@nuxthub/core')
}

if (enablePwa) {
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
  content: {
    database: {
      type: 'd1',
      bindingName: 'DB',
    },
  },
  routeRules: {
    '/': { prerender: true },
    '/organizations/bwhv-nf': { prerender: true },
    '/organizations/bwhv-nf?type=f': { prerender: true },
    '/organizations/bwhv-srm': { prerender: true },
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
  hub,
  nitro: {
    preset: 'cloudflare_module',
    cloudflare: {
      deployConfig: true,
      nodeCompat: true,
    },
    prerender: {
      concurrency: 1,
      interval: 250,
    },
  },
  i18n,
  pwa,
  sourcemap: {
    server: false,
    client: false,
  },
  runtimeConfig: {
    public: {
      dhbBaseUrl: process.env.DHB_BASE_URL || 'https://www.handball.net/a/sportdata/1',
    },
  },
  vite: {
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('vue') || id.includes('nuxt'))
                return 'framework'
              if (id.includes('@iconify'))
                return 'icons'
              if (id.includes('drizzle'))
                return 'db'
            }
          },
        },
      },
    },
  },
})
