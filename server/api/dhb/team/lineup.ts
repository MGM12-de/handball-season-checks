import type { H3Event } from 'h3'
import type { Game, Lineup } from '~~/types'
import { mergePlayerStats } from '../../../utils/dhbPlayerUtils'

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
        example: 'handball4all.wuerttemberg.1169541',
        summary: 'Team id',
      },
    ],
  },
})

async function processLineupsInBatches(
  games: Game[],
  teamId: string,
  batchSize: number = 3,
): Promise<Map<string, Lineup>> {
  const teamPlayersMap = new Map<string, Lineup>()

  for (let i = 0; i < games.length; i += batchSize) {
    const batch = games.slice(i, i + batchSize)
    const lineupPromises = batch.map(game =>
      $fetch('/api/dhb/game/lineup', {
        query: { id: game.id },
      }).catch((error) => {
        console.warn(`Failed to fetch lineup for game ${game.id}:`, error)
        return null
      }),
    )

    const lineups = await Promise.all(lineupPromises)

    // Process lineups for this batch
    lineups.forEach((lineup, index) => {
      if (!lineup)
        return // Skip failed requests

      const game = batch[index]
      const isHomeTeam = game.homeTeam.id === teamId
      const teamPlayers = isHomeTeam ? lineup.home : lineup.away

      teamPlayers?.forEach(player => mergePlayerStats(teamPlayersMap, player))
    })

    // Add small delay between batches to prevent overwhelming the API
    if (i + batchSize < games.length) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  return teamPlayersMap
}

export default defineCachedEventHandler(async (event) => {
  const query = getQuery(event)

  if (!query.id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No id received',
    })
  }

  try {
    const teamId = query.id as string

    // Fetch team games
    const teamGames: Game[] = await $fetch(`/api/dhb/team/games`, {
      query: { id: teamId },
    })

    if (!teamGames || teamGames.length === 0) {
      return []
    }

    // Process lineups in batches with error handling
    const teamPlayersMap = await processLineupsInBatches(teamGames, teamId)

    // Convert Map to Array and sort by goals (descending)
    const teamLineup = Array.from(teamPlayersMap.values()).sort((a, b) => b.goals - a.goals)

    return teamLineup
  }
  catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Error fetching team lineup data. (${error})`,
    })
  }
}, {
  maxAge: 60 * 60, // 1 hour
  name: 'team-lineup',
  swr: false,
  getKey: (event: H3Event) => event.path,
})
