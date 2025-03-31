import type { ModuleOptions } from '@vite-pwa/nuxt'

export const pwa: ModuleOptions = {
    registerType: 'autoUpdate',
    manifest: {
        name: 'Handball season checks',
        short_name: 'HaSeC',
        description: 'Handball season checks',
        theme_color: '#FFBF00',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        categories: ['games', 'sports', 'handball'],
        id: '/',
        orientation: 'portrait',
    },
    pwaAssets: {
        image: '../public/favicon.svg',
    },
    workbox: {
        navigateFallback: '/',
        globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    injectManifest: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    client: {
        installPrompt: true,
    },
    devOptions: {
        enabled: true,
        suppressWarnings: true,
        navigateFallback: '/',
        navigateFallbackAllowlist: [/^\/$/],
        type: 'module',
    },
}
