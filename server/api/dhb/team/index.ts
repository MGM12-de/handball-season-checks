import { getDHBBaseUrl } from "~/server/utils/dhbUtils"
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
  const teamApi = await $fetch(`${getDHBBaseUrl()}/teams/${query.id}`)

  return teamApi.data
})
