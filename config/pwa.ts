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
        scope: '/',
        categories: ['games', 'sports', 'handball'],
        id: '/',
        orientation: 'portrait',
        screenshots: [
            {
                src: '../public/screenshots/desktop_standing.png',
                type: 'image/png',
                sizes: '2417x1240',
                form_factor: 'wide',
                label: 'Table view of the current season standings',
            },
        ],
    },
    pwaAssets: {
        image: '../public/favicon.svg',
    },
    workbox: {
        navigateFallback: '/',
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        globIgnores: ['**/_payload.json', 'sw.js', 'manifest.webmanifest'],
        maximumFileSizeToCacheInBytes: 3000000,
        runtimeCaching: [
            {
                urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
                handler: 'NetworkFirst',
                options: {
                    cacheName: 'api-cache',
                    expiration: {
                        maxEntries: 50,
                        maxAgeSeconds: 60 * 5, // Cache for only 5 minutes
                    },
                    cacheableResponse: {
                        statuses: [0, 200],
                    },
                    networkTimeoutSeconds: 3,
                },
            },
        ],
    },
    client: {
        installPrompt: true,
        periodicSyncForUpdates: 3600,
    },
    devOptions: {
        enabled: true,
        suppressWarnings: true,
        navigateFallback: '/',
        navigateFallbackAllowlist: [/^\/$/],
        type: 'module',
    },
}
