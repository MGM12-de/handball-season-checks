import type { ModuleOptions } from '@nuxtjs/i18n'

export const i18n: ModuleOptions = {
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
}
