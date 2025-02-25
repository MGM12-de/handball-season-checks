import type { Team } from '../../../types'
import { getClubUrl } from '../../../server/utils/dhbUtils'

defineRouteMeta({
  openAPI: {
    description: 'Get club teams',
    tags: ['Team', 'DHB', 'Club'],
    parameters: [
      {
        in: 'query',
        name: 'id',
        required: true,
        example: 'handball4all.wuerttemberg.36',
        summary: 'Club id'
      }],
  }
})

export default defineEventHandler(async (event) => {
  // https://www.handball.net/a/sportdata/1/clubs/handball4all.wuerttemberg.36/teams

  const teams: Team[] = []

  const query = getQuery(event)

  if (!query.id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No id received',
    })
  }
  const clubId = query.id as string
  const teamsApi = await $fetch(`${getClubUrl(clubId)}/teams`)

  teamsApi.data.forEach((element) => {
    teams.push({
      id: element.id,
      teamGroupId: element.teamGroupId,
      name: element.name,
      acronym: element.acronym,
      defaultTournament: {
        id: element.defaultTournament.id,
        name: element.defaultTournament.name,
        acronym: element.defaultTournament.acronym,
        logo: element.defaultTournament.logo,
      },
    })
  })

  return teams
})
