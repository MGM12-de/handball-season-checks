import { i18n, pwa } from './config/config'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  extends: [],
  modules: ['@nuxt/content', '@nuxt/ui', '@nuxtjs/i18n', '@nuxt/image', '@scalar/nuxt', '@nuxt/eslint', '@nuxthub/core', '@vite-pwa/nuxt'],
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
