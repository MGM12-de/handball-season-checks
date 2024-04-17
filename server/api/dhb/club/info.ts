export default defineEventHandler(async (event) => {

  //https://www.handball.net/a/sportdata/1/clubs/handball4all.wuerttemberg.36/info
  const query = getQuery(event)

  if (!query.id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No id received',
    })
  }
  const clubInfo = await $fetch(`https://www.handball.net/a/sportdata/1/clubs/${query.id}/info`)

  return clubInfo.data
})
