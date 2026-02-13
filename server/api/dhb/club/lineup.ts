import type { Player, Team } from '~~/types'
import { getClubUrl } from '../../../../server/utils/dhbUtils'
import { getPlayerKey, mergePlayerStats } from '../../../utils/dhbPlayerUtils'

// Extended player interface with teams array
interface ClubPlayer extends Player {
  teams: Array<{
    id: string
    name: string
    acronym?: string
    ageGroup?: string
  }>
}

export default defineCachedEventHandler(async (event) => {
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

  // Create an array of promises for fetching team lineups
  const lineupPromises = clubTeams.data.map(team =>
    $fetch<Player[]>(`/api/dhb/team/lineup`, {
      query: { id: team.id },
    }),
  )

  // Wait for all lineup fetches to complete
  const teamLineups = await Promise.all(lineupPromises)

  // Process the lineups
  clubTeams.data.forEach((team, index) => {
    const teamLineup = teamLineups[index]
    for (const player of teamLineup) {
      const playerKey = getPlayerKey(player)
      const existingPlayer = clubPlayersMap.get(playerKey)

      if (existingPlayer) {
        // Player exists - merge stats and add team to teams array
        mergePlayerStats(clubPlayersMap, player)

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
}, {
  maxAge: 60 * 60, // 1 hour
  name: 'club-lineup',
  swr: false,
  getKey: event => event.path,
})
