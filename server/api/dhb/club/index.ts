import { z } from 'zod'
import { dhbFetch, getClubUrl, normalizeImageUrl } from '../../../../server/utils/dhbUtils'

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
        example: '6762',
      },
    ],
  },
})

const querySchema = z.object({
  id: z.string().min(1, 'Club ID is required'),
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
export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, data => querySchema.parse(data))

  try {
    const clubId = query.id as string
    // BEST EFFORT: see getClubUrl() - single-club-by-id is not a confirmed endpoint.
    const club = await dhbFetch<any>(getClubUrl(clubId))

    if (club?.data) {
      if (club.data.logo)
        club.data.logo = normalizeImageUrl(club.data.logo)
      if (club.data.federation) {
        club.data.organization = {
          id: club.data.federation.id,
          name: club.data.federation.name,
          logo: club.data.federation.image ? normalizeImageUrl(club.data.federation.image) : club.data.federation.image,
        }
      }
    }

    return club.data
  }
  catch (error) {
    // Handle potential errors from $fetch
    throw createError({
      statusCode: 500,
      statusMessage: `Error fetching club data. (${error})`,
      data: error,
    })
  }
})
