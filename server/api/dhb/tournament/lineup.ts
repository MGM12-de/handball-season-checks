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
  const lineup = []

  try {
    const tournamentId = query.id as string
    const tournamentTable = await $fetch(`${getTournamentUrl(tournamentId)}/table`)

    // Create an array of promises for fetching team lineups
    const lineupPromises = tournamentTable.data.rows.map(row =>
      $fetch(`/api/dhb/team/lineup`, {
        query: { id: row.team.id },
      }).then(teamLineup =>
        teamLineup.map(player => ({
          ...player,
          team: row.team,
        })),
      ),
    )

    // Wait for all promises to resolve
    const resolvedLineups = await Promise.all(lineupPromises)

    // Flatten the array of arrays into a single array
    resolvedLineups.forEach(teamPlayers => lineup.push(...teamPlayers))

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
