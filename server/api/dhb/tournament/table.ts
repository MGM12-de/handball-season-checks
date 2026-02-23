import { getTournamentUrl, normalizeImageUrl } from '../../../../server/utils/dhbUtils'

defineRouteMeta({
  openAPI: {
    description: 'Get tournament table',
    summary: 'Get tournament table',
    tags: ['Tournament', 'DHB'],
    parameters: [
      {
        in: 'query',
        name: 'id',
        required: true,
        example: 'handball4all.wuerttemberg.m-bol_hf',
      },
    ],
  },
})

export default defineEventHandler(async (event) => {
  // https://www.handball.net/a/sportdata/1/tournaments/handball4all.wuerttemberg.126171
  const query = getQuery(event)

  if (!query.id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No id received',
    })
  }
  try {
    const tournamentId = query.id as string
    const tournamentTable = await $fetch(`${getTournamentUrl(tournamentId)}/table`)

    tournamentTable.data.rows.forEach((row) => {
      if (row.team.logo) {
        row.team.logo = normalizeImageUrl(row.team.logo)
      }
    })

    return tournamentTable.data.rows
  }
  catch (error) {
    // Handle potential errors from $fetch
    throw createError({
      statusCode: 500,
      statusMessage: `Error fetching tournament data. (${error})`,
    })
  }
})
