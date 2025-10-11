import type { Game, Lineup } from '~~/types'

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

// Helper function to create a unique player key
function getPlayerKey(player: any): string {
  return `${player.firstname?.toLowerCase()}_${player.lastname?.toLowerCase()}`
}

// Helper function to merge player stats
function mergePlayerStats(playerMap: Map<string, Lineup>, player: any): void {
  const playerKey = getPlayerKey(player)
  const existingPlayer = playerMap.get(playerKey)

  if (existingPlayer) {
    existingPlayer.gamesPlayed += 1
    existingPlayer.goals += player.goals || 0
    existingPlayer.penaltyGoals += player.penaltyGoals || 0
    existingPlayer.penaltyMissed += player.penaltyMissed || 0
    existingPlayer.penalties += player.penalties || 0
    existingPlayer.yellowCards += player.yellowCards || 0
    existingPlayer.redCards += player.redCards || 0
    existingPlayer.blueCards += player.blueCards || 0
  }
  else {
    playerMap.set(playerKey, {
      ...player,
      gamesPlayed: 1,
      goals: player.goals || 0,
      penaltyGoals: player.penaltyGoals || 0,
      penaltyMissed: player.penaltyMissed || 0,
      penalties: player.penalties || 0,
      yellowCards: player.yellowCards || 0,
      redCards: player.redCards || 0,
      blueCards: player.blueCards || 0,
    })
  }
}

// Helper function to process lineups in batches
async function processLineupsInBatches(
  games: Game[],
  teamId: string,
  batchSize: number = 3,
): Promise<Map<string, Lineup>> {
  const playerMap = new Map<string, Lineup>()

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

      teamPlayers?.forEach(player => mergePlayerStats(playerMap, player))
    })

    // Add small delay between batches to prevent overwhelming the API
    if (i + batchSize < games.length) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  return playerMap
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
    const playerMap = await processLineupsInBatches(teamGames, teamId)

    // Convert Map to Array and sort by goals (descending)
    const teamLineup = Array.from(playerMap.values()).sort((a, b) => b.goals - a.goals)

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
  swr: true,
  getKey: event => event.path,
})
