import { getClubUrl, getDHBBaseUrl } from "~/server/utils/dhbUtils"

/**
 * Get members clubs
 */
export default defineEventHandler(async (event) => {

  //https://www.handball.net/a/sportdata/1/clubs/handball4all.wuerttemberg.1187/member-clubs
  const query = getQuery(event)

  if (!query.id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No id received',
    })
  }
  const clubId = query.id as string
  const clubInfo = await $fetch(`${getClubUrl(clubId)}/member-clubs`)

  return clubInfo.data
})
