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
        example: '6762',
      },
    ],
  },
})

/**
 * Get member clubs (e.g. Spielgemeinschaft sub-clubs).
 *
 * NOT YET AVAILABLE: the new handball.net API has no documented equivalent
 * of the old `/clubs/{id}/member-clubs` endpoint. Returning an empty list
 * degrades gracefully (see app/components/club/header.vue) instead of
 * calling a dead endpoint.
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  if (!query.id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No id received',
    })
  }

  return []
})
