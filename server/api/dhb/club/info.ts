import { getClubUrl } from '../../../../server/utils/dhbUtils'

/**
 * Get club info
 */
export default defineEventHandler(async (event) => {
  // https://www.handball.net/a/sportdata/1/clubs/handball4all.wuerttemberg.36/info
  const query = getQuery(event)

  if (!query.id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No id received',
    })
  }
  const clubId = query.id as string
  const clubInfo = await $fetch(`${getClubUrl(clubId)}/info`)

  return clubInfo.data
})
