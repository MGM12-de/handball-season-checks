import { getClubUrl, normalizeDHBUrl } from '../../../../server/utils/dhbUtils'

defineRouteMeta({
  openAPI: {
    description: 'Get Club data',
    summary: 'Get Club data',
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
 * Get Club data
 * @param {string} id - The id of the club to get
 * @returns {Club} The club data
 *
 * @swagger
 * /api/dhb/club:
 *   get:
 *     summary: Get Club data
 *     description: Get Club data
 *     tags: [Club]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The id of the club to get
 *     responses:
 *       200:
 *         description: The club data
 */
export default defineCachedEventHandler(async (event) => {
  // https://www.handball.net/a/sportdata/1/clubs/handball4all.wuerttemberg.36
  const query = getQuery(event)

  if (!query.id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No id received',
    })
  }
  try {
    const clubId = query.id as string
    const club = await $fetch(getClubUrl(clubId))

    if (club.data.logo) {
      club.data.logo = normalizeDHBUrl(club.data.logo)
    }

    if (club.data.organization.logo) {
      club.data.organization.logo = normalizeDHBUrl(club.data.organization.logo)
    }

    return club.data
  }
  catch (error) {
    // Handle potential errors from $fetch
    throw createError({
      statusCode: 500,
      statusMessage: `Error fetching club data. (${error})`,
    })
  }
}, {
  maxAge: 60 * 60 * 24 * 7, // 1 week
  name: 'club',
  swr: true,
  getKey: event => event.path,
})
