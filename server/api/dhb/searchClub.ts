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
  const clubs = await $fetch(`https://www.handball.net/a/sportdata/1/clubs/search?query=${query.clubName}`)
  
  clubs.data.forEach((club) => {
    if (club.logo) {
      club.logo = club.logo.replace(/handball-net:(.*)$/, 'https://handball.net/$1')
    }

    if(club.organization.logo) {
      club.organization.logo = club.organization.logo.replace(/handball-net:(.*)$/, 'https://handball.net/$1')
    }

  })
  return clubs.data
})
