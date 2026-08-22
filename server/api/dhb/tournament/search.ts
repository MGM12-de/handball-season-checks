import { dhbFetch, getCompetitionsUrl, getPhasesUrl } from '../../../../server/utils/dhbUtils'

defineRouteMeta({
  openAPI: {
    description: 'Search for a tournament (phase)',
    summary: 'Search for a tournament (phase)',
    tags: ['DHB'],
    parameters: [
      {
        in: 'query',
        name: 'tournamentName',
        required: true,
        example: 'Landesliga',
      },
    ],
    responses: {
      400: {
        description: 'Bad Request',
        summary: 'Expected a tournamentName but got none',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
          },
        },
      },
      200: {
        description: 'Found matching tournaments (phases)',
        summary: 'Found matching tournaments (phases)',
      },
    },
  },
})

const MAX_COMPETITIONS = 5

/**
 * BEST EFFORT: the old API's `tournaments/search?query=` has no identified
 * replacement. The new API only offers competition name search
 * (`/competitions?name=`), which is very broad (e.g. "Bezirksoberliga"
 * alone returns 863 hits nationwide) and one level above what this app
 * calls a "tournament" (a phase/Staffel). We search competitions, then
 * resolve their phases, capped to the first few competitions to bound the
 * number of API calls - a generic search term may not surface every match.
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  if (!query.tournamentName) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Expected a tournamentName but got none',
    })
  }

  const competitions = await dhbFetch<any[]>(getCompetitionsUrl(), {
    query: { name: query.tournamentName },
  })

  const topCompetitions = competitions.data.slice(0, MAX_COMPETITIONS)

  const phaseLists = await Promise.all(topCompetitions.map(competition =>
    dhbFetch<any[]>(getPhasesUrl(), { query: { competition_id: competition.id } })
      .then(response => response.data)
      .catch(() => []),
  ))

  const results: any[] = []

  topCompetitions.forEach((competition, index) => {
    (phaseLists[index] || []).forEach((phase: any) => {
      const federation = competition.championship?.federation

      results.push({
        id: phase.id,
        name: `${competition.name} – ${phase.name}`,
        acronym: phase.name,
        organization: federation
          ? { id: federation.id, name: federation.name }
          : undefined,
      })
    })
  })

  return results
})
