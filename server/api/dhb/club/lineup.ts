import type { Player, Team } from '~~/types'
import { getClubUrl } from '../../../../server/utils/dhbUtils'
import { getPlayerKey } from '../../../utils/dhbPlayerUtils'

// Extended player interface with teams array
interface ClubPlayer extends Player {
  teams: Array<{
    id: string
    name: string
    acronym?: string
    ageGroup?: string
  }>
}

interface ChunkLineupResult {
  teamId: string
  lineup: Player[]
}

function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = []

  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size))
  }

  return chunks
}

async function fetchClubLineupsInChunks(
  teams: Team[],
  chunkSize: number = 10,
): Promise<Array<{ team: Team, lineup: Player[] }>> {
  const teamById = new Map(teams.map(team => [team.id, team]))
  const teamIdChunks = chunkArray(teams.map(team => team.id), chunkSize)
  const results: Array<{ team: Team, lineup: Player[] }> = []

  for (let i = 0; i < teamIdChunks.length; i++) {
    const teamIds = teamIdChunks[i]
    if (!teamIds || teamIds.length === 0) {
      continue
    }

    const chunkResults = await $fetch<ChunkLineupResult[]>('/api/dhb/club/lineupChunk', {
      query: { teamIds: teamIds.join(',') },
    }).catch(() => [])

    for (const chunkResult of chunkResults) {
      const team = teamById.get(chunkResult.teamId)
      if (!team) {
        continue
      }

      results.push({
        team,
        lineup: chunkResult.lineup,
      })
    }

    if (i + 1 < teamIdChunks.length) {
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
  const clubTeams: { data: Team[] } = await $fetch(`${getClubUrl(clubId)}/teams`)

  const teamLineups = await fetchClubLineupsInChunks(clubTeams.data)

  // Process lineups and build player map
  teamLineups.forEach(({ team, lineup: teamLineup }) => {
    for (const player of teamLineup) {
      const playerKey = getPlayerKey(player)
      const existingPlayer = clubPlayersMap.get(playerKey)

      if (existingPlayer) {
        // Player exists - merge stats and add team to teams array
        existingPlayer.gamesPlayed += player.gamesPlayed || 1
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
          existingPlayer.teams.push({
            id: team.id,
            name: team.name,
            acronym: team.defaultTournament?.acronym,
            ageGroup: team.defaultTournament?.ageGroup,
          })
        }
      }
      else {
        // New player - add with teams as array
        clubPlayersMap.set(playerKey, {
          ...player,
          teams: [{
            id: team.id,
            name: team.name,
            acronym: team.defaultTournament?.acronym,
            ageGroup: team.defaultTournament?.ageGroup,
          }],
        })
      }
    }
  })

  // Convert Map to Array and sort by goals (descending)
  const lineups = Array.from(clubPlayersMap.values()).sort((a, b) => b.goals - a.goals)

  return lineups
})
