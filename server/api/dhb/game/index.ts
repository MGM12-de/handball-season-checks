import { getGameUrl } from '../../../../server/utils/dhbUtils'

defineRouteMeta({
  openAPI: {
    description: 'Get Game data',
    summary: 'Get Game data',
    tags: ['Game', 'DHB'],
    parameters: [
      {
        in: 'query',
        name: 'id',
        required: true,
        example: 'handball4all.wuerttemberg.8615461',
        summary: 'Game id'
      }],
  }
})

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  if (!query.id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No id received',
    })
  }

  try {
    const gameId = query.id as string
    const game = await $fetch(getGameUrl(gameId))

    return game.data
  }
  catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Error fetching game data. (${error})`,
    })
  }
})