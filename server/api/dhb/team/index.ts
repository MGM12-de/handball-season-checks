import { getTeamUrl } from "~/server/utils/dhbUtils"
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
  const teamId = query.id as string
  const teamApi = await $fetch(getTeamUrl(teamId))

  return teamApi.data
})
