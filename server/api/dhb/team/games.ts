import { Game } from "~/types"

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const games: Game[] = []

  if (!query.id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No id received',
    })
  }

  const teamApi = await $fetch(`https://www.handball.net/a/sportdata/1/teams/${query.id}/schedule`)

  teamApi.data.forEach(element => {
    if (element.startsAt)
      element.startsAt = new Date(element.startsAt)
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
        acronym: element.homeTeam.acronym
      },
      awayTeam: {
        id: element.awayTeam.id,
        teamGroupId: element.awayTeam.teamGroupId,
        name: element.awayTeam.name,
        acronym: element.awayTeam.acronym
      },
      tournament: {
        id: element.tournament.id,
        name: element.tournament.name
      },
      result: element.result,
      homeGoals: element.homeGoals,
      awayGoals: element.awayGoals,
      goalDifference: element.homeGoals - element.awayGoals,
      remarks: element.remarks,
      field: {
        id: element.field.id,
        name: element.field.name
      }
    })
  });
  return games
})
