import { dhbFetch, getPlayerStatsUrl } from '../../../../server/utils/dhbUtils'
import { mapPlayerStatsEntry } from '../../../utils/dhbPlayerUtils'

defineRouteMeta({
  openAPI: {
    description: 'Get team lineup',
    summary: 'Get team lineup',
    tags: ['Team', 'DHB'],
    parameters: [
      {
        in: 'query',
        name: 'id',
        required: true,
        example: '84219',
        summary: 'Team id',
      },
    ],
  },
})

/**
 * The new API exposes season-aggregated player stats directly
 * (`/stats/player-stats?team_id=`), so there's no need to fetch every game's
 * lineup and merge it client-side like the old API required.
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  if (!query.id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No id received',
    })
  }

  try {
    const teamId = query.id as string
    const stats = await dhbFetch<any[]>(getPlayerStatsUrl(), { query: { team_id: teamId } })

    return stats.data
      .map(mapPlayerStatsEntry)
      .sort((a, b) => b.goals - a.goals)
  }
  catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Error fetching team lineup data. (${error})`,
    })
  }
})
