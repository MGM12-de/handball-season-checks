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

  if (club.data.logo) {
    club.data.logo = club.data.logo.replace(/handball-net:(.*)$/, 'https://handball.net/$1')

  }

  if (club.data.organization.logo) {
    club.data.organization.logo = club.data.organization.logo.replace(/handball-net:(.*)$/, 'https://handball.net/$1')
    if (club.data.organization.logo.startsWith('/')) {
      club.data.organization.logo = 'https://handball.net' + club.data.organization.logo;
    }
  }

  return club.data
})
