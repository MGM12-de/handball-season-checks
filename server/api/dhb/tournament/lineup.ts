import { getTournamentUrl } from '../../../../server/utils/dhbUtils'
import team from '../team'


defineRouteMeta({
  openAPI: {
    description: 'Get tournament lineup',
    summary: 'Get tournament lineup',
    tags: ['Tournament', 'DHB'],
    parameters: [
      {
        in: 'query',
        name: 'id',
        required: true,
        example: 'handball4all.wuerttemberg.m-bol_hf',
      }],
  }
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
    var lineup = []
    const tournamentId = query.id as string
    const tournamentTable = await $fetch(`${getTournamentUrl(tournamentId)}/table`)

    for (const row of tournamentTable.data.rows) {
      const teamLineup = await $fetch(`/api/dhb/team/lineup`, {
        query: { id: row.team.id },
      })

      teamLineup.forEach((player) => {
        lineup.push({
          ...player,
          team: row.team
        })
      }
      )
    }

    return lineup
  }
  catch (error) {
    // Handle potential errors from $fetch
    throw createError({
      statusCode: 500,
      statusMessage: `Error fetching tournament data. (${error})`,
    })
  }
})
