import { getTeamUrl } from '~/server/utils/dhbUtils'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  if (!query.id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No id received',
    })
  }
  const teamId = query.id as string
  const teamApi = await $fetch(`${getTeamUrl(teamId)}/table`)
  const standings = teamApi.data.rows

  const currentTeam = standings.find(obj => obj.team.id === query.id)
  currentTeam.class = 'bg-primary-500/50 dark:primary-400/50 animate-pulse'

  return standings
})
