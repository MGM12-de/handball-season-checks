/**
 * Fetches the lineup of a club.
 */

import type { Player, Team } from '~~/types'

// Extended player interface with teams array
interface ClubPlayer extends Player {
  teams: Array<{
    id: string
    name: string
    acronym?: string
    ageGroup?: string
  }>
}

// Helper function to create a unique player key
function getPlayerKey(player: Player): string {
  return `${player.firstname?.toLowerCase()}_${player.lastname?.toLowerCase()}`
}

export default defineCachedEventHandler(async (event) => {
  const query = getQuery(event)

  if (!query.id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No id received',
    })
  }

  const playerMap = new Map<string, ClubPlayer>()
  const clubId = query.id as string
  const clubTeams: { data: Team[] } = await $fetch(`${getClubUrl(clubId)}/teams`)

  for (const team of clubTeams.data) {
    const teamLineup: Player[] = await $fetch(`/api/dhb/team/lineup`, {
      query: { id: team.id },
    })

    for (const player of teamLineup) {
      const playerKey = getPlayerKey(player)
      const existingPlayer = playerMap.get(playerKey)

      if (existingPlayer) {
        // Player exists - merge stats and add team to teams array
        existingPlayer.goals += player.goals || 0
        existingPlayer.penaltyGoals += player.penaltyGoals || 0
        existingPlayer.penaltyMissed += player.penaltyMissed || 0
        existingPlayer.penalties += player.penalties || 0
        existingPlayer.yellowCards += player.yellowCards || 0
        existingPlayer.redCards += player.redCards || 0
        existingPlayer.blueCards += player.blueCards || 0
        existingPlayer.gamesPlayed += player.gamesPlayed || 0

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
        playerMap.set(playerKey, {
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
  }

  // Convert Map to Array and sort by goals (descending)
  const lineups = Array.from(playerMap.values()).sort((a, b) => b.goals - a.goals)

  return lineups
}, {
  maxAge: 60 * 60, // 1 hour
  name: 'club-lineup',
  swr: true,
  getKey: event => event.path,
})
