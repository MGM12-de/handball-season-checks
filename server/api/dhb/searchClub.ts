import { getClubsUrl, normalizeImageUrl } from '../../../server/utils/dhbUtils'

defineRouteMeta({
  openAPI: {
    description: 'Search for a club',
    summary: 'Search for a club',
    tags: ['DHB'],
    parameters: [
      {
        in: 'query',
        name: 'clubName',
        required: true,
        example: 'THW Kiel',
      },
    ],
    responses: {
      400: {
        description: 'Bad Request',
        summary: 'Expected a clubname but got none',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
          },
        },
      },
      200: {
        description: 'Found a club',
        summary: 'Found a club',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Club',
              },
            },
          },
        },
      },
    },
  },
})

/**
 * Search for club
 * @param {import('node:http').IncomingMessage} event
 * @returns {Promise<Club[]>}
 * @throws {Error}
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  if (!query.clubName) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Expected a clubname but got none',
    })
  }
  const clubs = await $fetch(`${getClubsUrl()}/search?query=${query.clubName}`)

  clubs.data.forEach((club) => {
    if (club.logo) {
      club.logo = normalizeImageUrl(club.logo)
    }

    if (club.organization.logo) {
      club.organization.logo = normalizeImageUrl(club.organization.logo)
    }
  })
  return clubs.data
})
