import { currentRoundOnly, dhbFetch, getStandingsUrl } from '../../../../server/utils/dhbUtils'

defineRouteMeta({
  openAPI: {
    description: 'Get all tournament (phase) games',
    summary: 'Get all games in a phase by fetching games from each team and deduplicating',
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
  try {
    const query = getQuery(event)

    if (!query.id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No phase id received',
      })
    }

    const phaseId = query.id as string

    // Fetch phase standings to get all teams
    const standings = await dhbFetch<any[]>(getStandingsUrl(), { query: { phase_id: phaseId } })
    const teams = currentRoundOnly(standings.data).map((row: any) => row.team)

    // Fetch games for each team using own API
    const gamesByTeam = await Promise.all(
      teams.map((team: any) =>
        $fetch<any[]>(`/api/dhb/team/games?id=${team.id}`)
          .catch(() => []),
      ),
    )

    // Collect all games and deduplicate by game id
    const gamesMap = new Map<string, any>()

    gamesByTeam.forEach((games: any) => {
      if (!Array.isArray(games))
        return

      games.forEach((match: any) => {
        if (!gamesMap.has(match.id)) {
          gamesMap.set(match.id, {
            id: match.id,
            startsAt: match.startsAt,
            homeTeam: {
              id: match.homeTeam.id,
              name: match.homeTeam.name,
            },
            awayTeam: {
              id: match.awayTeam.id,
              name: match.awayTeam.name,
            },
            homeGoals: match.homeGoals,
            awayGoals: match.awayGoals,
            result: match.result,
            goalDifference: match.goalDifference,
          })
        }
      })
    })

    return Array.from(gamesMap.values())
  }
  catch (eor) {
    throw createError({
      statusCode: 500,
      statusMessage: `Error fetching tournament games: ${eor}`,
    })
  }
})
