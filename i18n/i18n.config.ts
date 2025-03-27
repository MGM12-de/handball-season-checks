export default defineI18nConfig(() => ({
    legacy: false,
    locale: 'en',
    messages: {
        en: {
            welcome: 'Welcome',
            searchTournament: 'Search tournament',
            handball: 'Handball',
            siteTitle: 'Season checks',
        },
        de: {
            welcome: 'Willkommen',
            searchTournament: 'Liga suchen',
            handball: 'Handball',
            siteTitle: 'Handball-Checks',
        },
    },
}))
