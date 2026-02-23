import type { Team } from '../../../../types'
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
export default defineEventHandler(async (event) => {
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

    return clubTeams.data.map((team: any) => {
        return {
            id: team.id,
            teamGroupId: team.teamGroupId,
            name: team.name,
            acronym: team.acronym,
            logo: team.logo,
            defaultTournament: team.defaultTournament
                ? {
                    id: team.defaultTournament.id,
                    name: team.defaultTournament.name,
                    acronym: team.defaultTournament.acronym,
                    logo: team.defaultTournament.logo,
                }
                : undefined,
        } as Team
    })
})
