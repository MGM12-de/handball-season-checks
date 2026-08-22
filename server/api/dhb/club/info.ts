defineRouteMeta({
  openAPI: {
    description: 'Get Club info',
    summary: 'Get Club info',
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
 * Get club info.
 *
 * The old API had a separate `/clubs/{id}/info` sub-resource. The new API's
 * club object already includes address/contact/installation details inline
 * (see `/api/dhb/club`), so this just delegates to that endpoint.
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  if (!query.id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No id received',
    })
  }

  return $fetch('/api/dhb/club', {
    query: { id: query.id },
  })
})
