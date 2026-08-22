import { dhbFetch, getMatchesUrl } from '../../../../server/utils/dhbUtils'

defineRouteMeta({
  openAPI: {
    description: 'Get Game (match) data',
    summary: 'Get Game (match) data',
    tags: ['Game', 'DHB'],
    parameters: [
      {
        in: 'query',
        name: 'id',
        required: true,
        example: '545201',
        summary: 'Match id',
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

  try {
    const matchId = query.id as string
    const match = await dhbFetch<any[]>(getMatchesUrl(), { query: { match_id: matchId } })

    return match.data[0] ?? null
  }
  catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Error fetching game data. (${error})`,
    })
  }
})
