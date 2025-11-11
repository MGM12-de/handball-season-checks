import type { Team } from '../../../types'
import { getClubUrl } from '../../../server/utils/dhbUtils'

defineRouteMeta({
  openAPI: {
    description: 'Get club teams',
    summary: 'Get club teams',
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

  const query = getQuery(event)

  if (!query.id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No id received',
    })
  }
  const clubId = query.id as string
  const teamsApi = await $fetch(`${getClubUrl(clubId)}/teams`)

  return teamsApi.data.map((team: any) => {
    return {
      id: team.id,
      teamGroupId: team.teamGroupId,
      name: team.name,
      acronym: team.acronym,
      logo: team.logo,
      defaultTournament: team.defaultTournament ? {
        id: team.defaultTournament.id,
        name: team.defaultTournament.name,
        acronym: team.defaultTournament.acronym,
        logo: team.defaultTournament.logo,
      } : undefined,
    } as Team
  })
})