import { z } from 'zod'
import { extractScores, fetchH4AllLeague, mapH4AllStandingsRow } from '../../../../server/utils/h4allUtils'

const querySchema = z.object({
  id: z.string().min(1, 'League id is required'),
})

defineRouteMeta({
  openAPI: {
    description: 'Get H4All league table',
    summary: 'Get H4All league table',
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
    return extractScores(raw).map(mapH4AllStandingsRow)
  }
  catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Error fetching H4All table. (${error})`,
    })
  }
})
