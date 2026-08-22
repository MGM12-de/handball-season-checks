import type { Team } from '../../../../types'
import { fetchTeamsForClub } from '../../../../server/utils/dhbUtils'

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
        example: '6762',
      },
    ],
  },
})

/**
 * Get club teams
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  if (!query.id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No id received',
    })
  }
  const clubId = query.id as string
  const teams = await fetchTeamsForClub(clubId)

  return teams.map((team: any) => {
    return {
      id: team.id,
      name: team.name,
      logo: team.club?.logo,
      club: team.club,
      gender: team.gender,
      ageCategory: team.age_category,
    } as Team
  })
})
