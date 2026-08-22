import type { Player } from '~~/types'
import { dhbFetch, fetchTeamsForClub, getPlayerStatsUrl } from '../../../../server/utils/dhbUtils'
import { getPlayerKey, mapPlayerStatsEntry } from '../../../utils/dhbPlayerUtils'

// Extended player interface with teams array
interface ClubPlayer extends Player {
  teams: Array<{ id: number, name: string }>
}

function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = []

  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size))
  }

  return chunks
}

async function fetchClubLineupsInChunks(
  teams: any[],
  chunkSize: number = 10,
): Promise<Array<{ team: any, lineup: Player[] }>> {
  const teamChunks = chunkArray(teams, chunkSize)
  const results: Array<{ team: any, lineup: Player[] }> = []

  for (let i = 0; i < teamChunks.length; i++) {
    const chunk = teamChunks[i]
    if (!chunk || chunk.length === 0) {
      continue
    }

    const chunkResults = await Promise.all(chunk.map(async (team) => {
      const stats = await dhbFetch<any[]>(getPlayerStatsUrl(), {
        query: { team_id: team.id },
      }).catch(() => ({ data: [] }))

      return { team, lineup: stats.data.map(mapPlayerStatsEntry) }
    }))

    results.push(...chunkResults)

    if (i + 1 < teamChunks.length) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  return results
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  if (!query.id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No id received',
    })
  }

  const clubPlayersMap = new Map<string, ClubPlayer>()
  const clubId = query.id as string
  const clubTeams = await fetchTeamsForClub(clubId)

  const teamLineups = await fetchClubLineupsInChunks(clubTeams)

  // Process lineups and build player map
  teamLineups.forEach(({ team, lineup: teamLineup }) => {
    for (const player of teamLineup) {
      const playerKey = getPlayerKey(player)
      const existingPlayer = clubPlayersMap.get(playerKey)

      if (existingPlayer) {
        // Player exists - merge stats and add team to teams array
        existingPlayer.gamesPlayed += player.gamesPlayed || 0
        existingPlayer.goals += player.goals || 0
        existingPlayer.penaltyGoals += player.penaltyGoals || 0
        existingPlayer.penaltyMissed += player.penaltyMissed || 0
        existingPlayer.penalties += player.penalties || 0
        existingPlayer.yellowCards += player.yellowCards || 0
        existingPlayer.redCards += player.redCards || 0
        existingPlayer.blueCards += player.blueCards || 0

        // Add team to teams array if not already present
        const teamExists = existingPlayer.teams.some(t => t.id === team.id)
        if (!teamExists) {
          existingPlayer.teams.push({ id: team.id, name: team.name })
        }
      }
      else {
        // New player - add with teams as array
        clubPlayersMap.set(playerKey, {
          ...player,
          teams: [{ id: team.id, name: team.name }],
        })
      }
    }
  })

  // Convert Map to Array and sort by goals (descending)
  const lineups = Array.from(clubPlayersMap.values()).sort((a, b) => b.goals - a.goals)

  return lineups
})
