export default defineI18nConfig(() => ({
    legacy: false,
    locale: 'en',
    messages: {
        en: {
            welcome: 'Welcome',
            searchTournament: 'Search tournament',
            handball: 'Handball',
            siteTitle: 'Season checks',
            siteDescription: 'A website to check the current season',
            name: 'Name',
            clubName: 'Club name',
            search: 'Search',
        },
        de: {
            welcome: 'Willkommen',
            searchTournament: 'Liga suchen',
            handball: 'Handball',
            siteTitle: 'Handball-Checks',
            siteDescription: 'Eine Webseite um die Handball-Saison zu überprüfen',
            name: 'Name',
            clubName: 'Vereinsname',
            search: 'Suchen',
        },
    },
}))
