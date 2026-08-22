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
  return fetchTeamsForClub(clubId)
})
