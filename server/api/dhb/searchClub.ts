import { getClubsUrl, normalizeDHBUrl } from '../../../server/utils/dhbUtils'

defineRouteMeta({
  openAPI: {
    description: 'Search for a club',
    parameters: [
      {
        in: 'query',
        name: 'clubName',
        required: true,
        example: 'THW Kiel',
      }],
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

  if (!query.clubName) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Expected a clubname but got none',
    })
  }
  const clubs = await $fetch(`${getClubsUrl()}/search?query=${query.clubName}`)

  clubs.data.forEach((club) => {
    if (club.logo) {
      club.logo = normalizeDHBUrl(club.logo)
    }

    if (club.organization.logo) {
      club.organization.logo = normalizeDHBUrl(club.organization.logo)
    }
  })
  return clubs.data
})
