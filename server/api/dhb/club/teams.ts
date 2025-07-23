import { getClubUrl } from '../../../../server/utils/dhbUtils'

defineRouteMeta({
    openAPI: {
        description: 'Get Club teams',
        summary: 'Get Club teams',
        tags: ['Club', 'DHB', 'Team'],
        parameters: [
            {
                in: 'query',
                name: 'id',
                required: true,
                example: 'handball4all.wuerttemberg.36',
            },
        ],
    },
})

/**
 * Get club info
 */
export default defineCachedEventHandler(async (event) => {
    // https://www.handball.net/a/sportdata/1/clubs/handball4all.wuerttemberg.36/info
    const query = getQuery(event)

    if (!query.id) {
        throw createError({
            statusCode: 400,
            statusMessage: 'No id received',
        })
    }
    const clubId = query.id as string
    const clubTeams = await $fetch(`${getClubUrl(clubId)}/teams`)

    return clubTeams.data
}, {
    maxAge: 60 * 60 * 24 * 7, // 1 week
    name: 'club-teams',
    swr: true,
    getKey: event => event.path,
})
