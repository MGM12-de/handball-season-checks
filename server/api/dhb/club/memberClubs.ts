import { getClubUrl } from '../../../../server/utils/dhbUtils'

defineRouteMeta({
  openAPI: {
    description: 'Get member clubs',
    summary: 'Get member clubs',
    tags: ['Club', 'DHB'],
    parameters: [
      {
        in: 'query',
        name: 'id',
        required: true,
        example: 'handball4all.wuerttemberg.1187',
      },
    ],
  },
})

/**
 * Get members clubs
 */
export default defineEventHandler(async (event) => {
  // https://www.handball.net/a/sportdata/1/clubs/handball4all.wuerttemberg.1187/member-clubs
  const query = getQuery(event)

  if (!query.id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No id received',
    })
  }
  const clubId = query.id as string
  const clubInfo = await $fetch(`${getClubUrl(clubId)}/member-clubs`)

  clubInfo.data.forEach((club: any) => {
    if (club.logo) {
      club.logo = normalizeDHBUrl(club.logo)
    }
  })

  return clubInfo.data
})
