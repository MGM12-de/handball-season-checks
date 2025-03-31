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

export default defineCachedEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const games: Game[] = []

    if (!query.id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No id received',
      })
    }
    const teamId = query.id as string
    const teamApi = await $fetch(`/api/dhb/team/games`, {
      query: { id: teamId },
    })

    const teamLineup = new Array<Lineup>()

    await Promise.all(teamApi.map(async (game) => {
      const lineup = await $fetch('/api/dhb/game/lineup', {
        query: { id: game.id },
      })

      const mergePlayerStats = (player) => {
        const existingPlayerIndex = teamLineup.findIndex(p => p.firstname === player.firstname && p.lastname === player.lastname)
        if (existingPlayerIndex !== -1) {
          teamLineup[existingPlayerIndex].gamesPlayed += 1
          teamLineup[existingPlayerIndex].goals += player.goals
          teamLineup[existingPlayerIndex].penaltyGoals += player.penaltyGoals
          teamLineup[existingPlayerIndex].penaltyMissed += player.penaltyMissed
          teamLineup[existingPlayerIndex].penalties += player.penalties
          teamLineup[existingPlayerIndex].yellowCards += player.yellowCards
          teamLineup[existingPlayerIndex].redCards += player.redCards
          teamLineup[existingPlayerIndex].blueCards += player.blueCards
        }
        else {
          teamLineup.push({
            ...player,
            gamesPlayed: 1,
          })
        }
      }

      if (game.homeTeam.id === teamId) {
        lineup.home.forEach(homePlayer => mergePlayerStats(homePlayer))
      }
      else {
        lineup.away.forEach(awayPlayer => mergePlayerStats(awayPlayer))
      }
    }))
    return teamLineup
  }
  catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Error fetching team lineup data. (${error})`,
    })
  }
}, {
  maxAge: 60 * 60 * 24, // 1 day
  name: 'team-lineup',
  swr: true,
  getKey: event => event.path,
})
