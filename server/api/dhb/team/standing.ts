import { getDHBBaseUrl } from "~/server/utils/dhbUtils"

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  if (!query.id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No id received',
    })
  }
  const teamApi = await $fetch(`${getDHBBaseUrl()}/teams/${query.id}/table`)
  var standings = teamApi.data.rows

  var currentTeam = standings.find((obj) => obj.team.id === query.id)
  currentTeam.class = 'bg-primary-500/50 dark:primary-400/50 animate-pulse'

  return standings
})
