import { z } from 'zod'
import { extractGames, fetchH4AllLeague, getReportBaseUrl, mapH4AllGame } from '../../../../server/utils/h4allUtils'

const querySchema = z.object({
  id: z.string().min(1, 'League id is required'),
})

defineRouteMeta({
  openAPI: {
    description: 'Get H4All league games',
    summary: 'Get H4All league games',
    tags: ['Tournament', 'H4All'],
    parameters: [
      {
        in: 'query',
        name: 'id',
        required: true,
        example: '3:87355',
        summary: 'League id ("<og>:<classId>")',
      },
    ],
  },
})

export default defineEventHandler(async (event): Promise<any[]> => {
  const query = await getValidatedQuery(event, data => querySchema.parse(data))

  try {
    const raw = await fetchH4AllLeague(query.id)
    const reportBaseUrl = getReportBaseUrl(raw)
    return extractGames(raw).map(game => mapH4AllGame(game, reportBaseUrl))
  }
  catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Error fetching H4All games. (${error})`,
    })
  }
})
