import { Team } from "~/types"

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
  const teamsApi = await $fetch(`https://www.handball.net/a/sportdata/1/clubs/${query.id}/teams`)

  teamsApi.data.forEach(element => {
    teams.push({
      id: element.id,
      teamGroupId: element.teamGroupId,
      name: element.name,
      acronym: element.acronym,
      defaultTournament: {
        id: element.defaultTournament.id,
        name: element.defaultTournament.name,
        acronym: element.defaultTournament.acronym,
        logo: element.defaultTournament.logo
      }
    })
  });

  return teams
})
