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
      {
        in: 'query',
        name: 'phase',
        required: false,
        example: 'sportradar.dhbdata.18980',
      },
    ],
  },
})

export default defineEventHandler(async (event) => {
  // https://www.handball.net/a/sportdata/1/tournaments/handball4all.wuerttemberg.126171
  const query = getQuery(event)
  let url

  if (!query.id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No id received',
    })
  }
  try {
    const tournamentId = query.id as string
    if (query.phase) {
      url = `${getTournamentUrl(tournamentId)}/table?phase=${query.phase}`
    }
    else {
      url = `${getTournamentUrl(tournamentId)}/table`
    }
    const tournamentTable = await $fetch(url)

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
