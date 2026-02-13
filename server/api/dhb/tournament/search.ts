import { getClubsUrl, normalizeImageUrl } from '../../../../server/utils/dhbUtils'

defineRouteMeta({
  openAPI: {
    description: 'Search for a club',
    summary: 'Search for a club',
    tags: ['DHB'],
    parameters: [
      {
        in: 'query',
        name: 'tournamentName',
        required: true,
        example: 'BOL_HF',
      }],
    responses: {
      400: {
        description: "Bad Request",
        summary: "Expected a clubname but got none",
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            }
          }
        }
      },
      200: {
        description: "Found a club",
        summary: "Found a club",
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Club'
              }
            }
          }
        }
      }
    }
  }
})

/**
 * Search for club
 * @param {import('node:http').IncomingMessage} event
 * @returns {Promise<Club[]>}
 * @throws {Error}
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  if (!query.tournamentName) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Expected a tournamentName but got none',
    })
  }
  const tournaments = await $fetch(`${getTournamentsUrl()}/search?query=${query.tournamentName}`)

  tournaments.data.forEach((tournament) => {
    if (tournament.logo) {
      tournament.logo = normalizeImageUrl(tournament.logo)
    }

    if (tournament.organization.logo) {
      tournament.organization.logo = normalizeImageUrl(tournament.organization.logo)
    }
  })
  return tournaments.data
})
