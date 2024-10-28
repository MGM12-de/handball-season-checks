/**
 * Search for club
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

  return clubs.data
})
