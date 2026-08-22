import { z } from 'zod'
import { dhbFetch, getClubSearchUrl, normalizeImageUrl } from '../../../server/utils/dhbUtils'

const querySchema = z.object({
  clubName: z.string().min(1, 'Expected a clubname but got none'),
})

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
  const query = await getValidatedQuery(event, data => querySchema.parse(data))

  const clubs = await dhbFetch<any[]>(getClubSearchUrl(), {
    query: {
      'all': 1,
      'filter[search]': query.clubName,
    },
  })

  return clubs.data.map((club: any) => ({
    ...club,
    logo: club.logo ? normalizeImageUrl(club.logo) : club.logo,
    // Compat shim: the old API nested a club's Verband/Bezirk under
    // `organization`; the new API calls the same thing `federation`.
    organization: club.federation
      ? {
          id: club.federation.id,
          name: club.federation.name,
          logo: club.federation.image ? normalizeImageUrl(club.federation.image) : club.federation.image,
        }
      : undefined,
  }))
})
