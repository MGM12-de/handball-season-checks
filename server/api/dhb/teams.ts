import { fetchTeamsForClub } from '../../../server/utils/dhbUtils'

defineRouteMeta({
  openAPI: {
    description: 'Get club teams',
    summary: 'Get club teams',
    tags: ['Team', 'DHB', 'Club'],
    parameters: [
      {
        in: 'query',
        name: 'id',
        required: true,
        example: '6762',
        summary: 'Club id',
      },
    ],
  },
})

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
