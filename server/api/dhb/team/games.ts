import type { Game } from '../../../../types'
import { dhbFetchAllPages, getMatchesUrl } from '../../../../server/utils/dhbUtils'

defineRouteMeta({
  openAPI: {
    description: 'Get team games data',
    summary: 'Get team games data',
    tags: ['Team', 'DHB'],
    parameters: [
      {
        in: 'query',
        name: 'id',
        required: true,
        example: '84219',
        summary: 'Team id',
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
        statusMessage: 'No id received',
      })
    }

    const teamId = query.id as string
    const matches = await dhbFetchAllPages<any>(getMatchesUrl(), { team_id: teamId })

    const games: Game[] = matches.map((match) => {
      const homeGoals = match.result?.local ?? undefined
      const awayGoals = match.result?.visitor ?? undefined
      const hasResult = homeGoals != null && awayGoals != null

      const date = match.date ? new Date(match.date) : null
      const startsAt = date
        ? `${date.toLocaleDateString('de')}, ${date.toLocaleTimeString('de', {
          hour: '2-digit',
          minute: '2-digit',
        })}`
        : match.date

      return {
        id: match.id,
        startsAt,
        homeTeam: {
          id: match.local.id,
          name: match.local.name,
        },
        awayTeam: {
          id: match.visitor.id,
          name: match.visitor.name,
        },
        tournament: match.phase
          ? {
              id: match.phase.id,
              name: match.phase.name,
              competition: match.phase.competition,
            }
          : undefined,
        result: hasResult ? `${homeGoals}:${awayGoals}` : undefined,
        homeGoals,
        awayGoals,
        goalDifference: hasResult ? homeGoals - awayGoals : undefined,
        field: match.field
          ? {
              id: match.field.id,
              name: match.field.name,
              city: match.field.installation?.address,
            }
          : undefined,
      } as Game
    })

    return games
  }
  catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Error fetching team game data. (${error})`,
    })
  }
})
