import { currentRoundOnly, dhbFetch, getPlayerStatsUrl, getStandingsUrl, mapStandingsRow } from '../../../../server/utils/dhbUtils'
import { mapPlayerStatsEntry } from '../../../utils/dhbPlayerUtils'

defineRouteMeta({
  openAPI: {
    description: 'Get tournament (phase) lineup',
    summary: 'Get tournament (phase) lineup',
    tags: ['Tournament', 'DHB'],
    parameters: [
      {
        in: 'query',
        name: 'id',
        required: true,
        example: '14360',
        summary: 'Phase id',
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
    const phaseId = query.id as string
    const standings = await dhbFetch<any[]>(getStandingsUrl(), { query: { phase_id: phaseId } })
    const rows = currentRoundOnly(standings.data)

    // Helper function to process promises in batches
    const processInBatches = async <T, R>(items: T[], batchSize: number, callback: (item: T) => Promise<R>) => {
      const results: R[] = []
      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize)
        const batchResults = await Promise.all(batch.map(callback))
        results.push(...batchResults)
        if (i + batchSize < items.length) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }
      return results
    }

    const batchSize = 3
    const resolvedLineups = await processInBatches(rows, batchSize, async (row: any) => {
      const team = mapStandingsRow(row).team
      const stats = await dhbFetch<any[]>(getPlayerStatsUrl(), { query: { team_id: team.id } })
        .catch(() => ({ data: [] }))

      return stats.data.map(mapPlayerStatsEntry).map(player => ({
        ...player,
        team,
      }))
    })

    return resolvedLineups.flat()
  }
  catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Error fetching tournament data. (${error})`,
    })
  }
})
