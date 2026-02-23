import { getClubUrl } from '../../../../server/utils/dhbUtils'

defineRouteMeta({
  openAPI: {
    description: 'Get Club info',
    summary: 'Get Club info',
    tags: ['Club', 'DHB'],
    parameters: [
      {
        in: 'query',
        name: 'id',
        required: true,
        example: 'handball4all.wuerttemberg.36',
      },
    ],
  },
})

/**
 * Get club info
 */
export default defineCachedEventHandler(async (event) => {
  // https://www.handball.net/a/sportdata/1/clubs/handball4all.wuerttemberg.36/info
  const query = getQuery(event)

  if (!query.id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No id received',
    })
  }
  const clubId = query.id as string
  const clubInfo = await $fetch(`${getClubUrl(clubId)}/info`)

  return clubInfo.data
}, {
  maxAge: 60 * 60 * 24 * 7, // 1 week
  name: 'club-info',
  swr: true,
  getKey: event => event.path,
})
