import type { Game } from '../../../../types'
import { de, el } from '@nuxt/ui/runtime/locale/index.js'
import { getTeamUrl } from '../../../../server/utils/dhbUtils'

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
        example: 'handball4all.wuerttemberg.36',
        summary: 'Team id',
      },
    ],
  },
})

export default cachedEventHandler(async (event) => {
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
    const teamApi = await $fetch(`${getTeamUrl(teamId)}/schedule`)

    teamApi.data.forEach((element) => {
      if (element.startsAt) {
        const date = new Date(element.startsAt)
        element.startsAt = `${date.toLocaleDateString('de')}, ${date.toLocaleTimeString('de', {
          hour: '2-digit',
          minute: '2-digit',
        })}`
      }
      if (element.homeGoals) {
        element.result = `${element.homeGoals}:${element.awayGoals}`
      }

      games.push({
        id: element.id,
        startsAt: element.startsAt,
        homeTeam: {
          id: element.homeTeam.id,
          teamGroupId: element.homeTeam.teamGroupId,
          name: element.homeTeam.name,
          acronym: element.homeTeam.acronym,
        },
        awayTeam: {
          id: element.awayTeam.id,
          teamGroupId: element.awayTeam.teamGroupId,
          name: element.awayTeam.name,
          acronym: element.awayTeam.acronym,
        },
        tournament: {
          id: element.tournament.id,
          name: element.tournament.name,
        },
        referee: element.refereeInfo,
        result: element.result,
        homeGoals: element.homeGoals,
        awayGoals: element.awayGoals,
        goalDifference: element.homeGoals - element.awayGoals,
        remarks: element.remarks,
        field: {
          id: element.field.id,
          fieldNumber: element.field.fieldNumber,
          name: element.field.name,
          city: element.field.city,
        },
        pdfUrl: element.pdfUrl,
      })
    })
    return games
  }
  catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Error fetching team game data. (${error})`,
    })
  }
}, {
  maxAge: 60 * 60, // 1 hour
  name: 'team-games',
  swr: true,
  getKey: event => event.path,
})
