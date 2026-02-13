import { getTournamentUrl, normalizeDHBUrl } from '../../../../server/utils/dhbUtils'
import team from '../team'

defineRouteMeta({
  openAPI: {
    description: 'Get tournament lineup',
    summary: 'Get tournament lineup',
    tags: ['Tournament', 'DHB'],
    parameters: [
      {
        in: 'query',
        name: 'id',
        required: true,
        example: 'handball4all.wuerttemberg.m-bol_hf',
      },
    ],
  },
})

export default defineCachedEventHandler(async (event) => {
  const query = getQuery(event)

  if (!query.id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No id received',
    })
  }

  try {
    const tournamentId = query.id as string
    const tournamentTable = await $fetch(`${getTournamentUrl(tournamentId)}/table`)

    // Helper function to process promises in batches
    const processInBatches = async (items, batchSize, callback) => {
      const results = []
      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize)
        const batchResults = await Promise.all(batch.map(callback))
        results.push(...batchResults)
        // Optional: Add small delay between batches to prevent overwhelming the API
        if (i + batchSize < items.length) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }
      return results
    }

    // Helper function to normalize team logo
    const normalizeTeamLogo = (team) => {
      return {
        ...team,
        logo: normalizeDHBUrl(team.logo),
      }
    }

    // Process team lineups in batches of 3-5
    const batchSize = 3
    const resolvedLineups = await processInBatches(
      tournamentTable.data.rows,
      batchSize,
      async (row) => {
        const teamLineup = await $fetch(`/api/dhb/team/lineup`, {
          query: { id: row.team.id },
        })
        return teamLineup.map(player => ({
          ...player,
          team: normalizeTeamLogo(row.team),
        }))
      },
    )

    // Flatten results
    const lineup = []
    resolvedLineups.forEach(teamPlayers => lineup.push(...teamPlayers))

    return lineup
  }
  catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Error fetching tournament data. (${error})`,
    })
  }
}, {
  maxAge: 60 * 60 * 24, // 1 day
  name: 'tournament-lineup',
  swr: false,
  getKey: event => `${event.path}`,
})
