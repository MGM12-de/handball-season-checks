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
    },
    pwaAssets: {
        image: '../public/favicon.svg',
    },

}
