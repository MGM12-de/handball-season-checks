export default defineEventHandler(async (event) => {


  //https://www.handball.net/a/sportdata/1/clubs/handball4all.wuerttemberg.36
  const query = getQuery(event)

  if (!query.id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No id received',
    })
  }
  const club = await $fetch(`https://www.handball.net/a/sportdata/1/clubs/${query.id}`)

  return club.data
})
