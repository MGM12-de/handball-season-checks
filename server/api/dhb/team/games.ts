export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  if (!query.id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No id received',
    })
  }
  const teamApi = await $fetch(`https://www.handball.net/a/sportdata/1/teams/${query.id}/schedule`)

  return teamApi.data
})
