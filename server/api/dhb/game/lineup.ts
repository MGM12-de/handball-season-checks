import type { Game } from '../../../../types'
import { getGameUrl } from '../../../../server/utils/dhbUtils'

defineRouteMeta({
  openAPI: {
    description: 'Get game lineup',
    summary: 'Get game lineup',
    tags: ['Team', 'DHB', 'Game'],
    parameters: [
      {
        in: 'query',
        name: 'id',
        required: true,
        example: 'handball4all.wuerttemberg.7762871',
        summary: 'Game id'
      }],
  }
})

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  // const lineup: Lineup[] = []

  if (!query.id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No id received',
    })
  }

  const gameId = query.id as string
  const teamApi = await $fetch(`${getGameUrl(gameId)}/lineup`)

  return teamApi.data
})
