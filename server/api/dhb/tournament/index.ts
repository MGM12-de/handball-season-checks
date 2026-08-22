import { dhbFetch, getMatchesUrl, getStandingsUrl } from '../../../../server/utils/dhbUtils'

defineRouteMeta({
  openAPI: {
    description: 'Get tournament (phase) data',
    summary: 'Get tournament (phase) data',
    tags: ['Tournament', 'DHB'],
    parameters: [
      {
        in: 'query',
        name: 'id',
        required: true,
        example: '14360',
        summary: 'Phase id',
      },
    ],
  },
})

/**
 * BEST EFFORT: the new API has no documented "get phase by id" endpoint
 * (old `/tournaments/{id}` has no identified replacement). Phase metadata
 * (name, competition, championship) is only embedded in match objects, so
 * we resolve one team from the phase's standings and read it off one of
 * that team's matches.
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  if (!query.id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No id received',
    })
  }

  try {
    const phaseId = query.id as string
    const standings = await dhbFetch<any[]>(getStandingsUrl(), { query: { phase_id: phaseId } })
    const anyTeamId = standings.data[0]?.team?.id

    if (!anyTeamId) {
      return null
    }

    const matches = await dhbFetch<any[]>(getMatchesUrl(), { query: { team_id: anyTeamId, page: 1 } })
    const phase = matches.data.find(match => String(match.phase?.id) === String(phaseId))?.phase

    return {
      id: Number(phaseId),
      name: phase?.name,
      acronym: phase?.name,
      competition: phase?.competition,
    }
  }
  catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Error fetching tournament data. (${error})`,
    })
  }
})
