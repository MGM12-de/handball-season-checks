import { z } from 'zod'
import { currentRoundOnly, dhbFetch, getMatchesUrl, getStandingsUrl, mapStandingsRow } from '../../../../server/utils/dhbUtils'

const querySchema = z.object({
  id: z.string().min(1, 'Phase ID is required'),
})

defineRouteMeta({
  openAPI: {
    description: 'Get tournament (phase) table',
    summary: 'Get tournament (phase) table',
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
 * BEST EFFORT: standings rows don't carry the phase's name, only team/points
 * data. To resolve promotion/relegation rules (keyed by phase name, see
 * promotion-relegation-rules.ts) we peek at one match of one team in the
 * standings and read its embedded `phase.name`.
 */
async function resolvePhaseName(phaseId: string, anyTeamId?: number): Promise<string | undefined> {
  if (!anyTeamId)
    return undefined

  try {
    const matches = await dhbFetch<any[]>(getMatchesUrl(), { query: { team_id: anyTeamId, page: 1 } })
    return matches.data.find(match => String(match.phase?.id) === String(phaseId))?.phase?.name
  }
  catch {
    return undefined
  }
}

export default defineEventHandler(async (event): Promise<any[]> => {
  const query = await getValidatedQuery(event, data => querySchema.parse(data))
  const teamDetailsCache = new Map<string, Promise<any>>()

  try {
    const standings = await dhbFetch<any[]>(getStandingsUrl(), { query: { phase_id: query.id } })
    const rows = currentRoundOnly(standings.data)

    const phaseName = await resolvePhaseName(query.id, rows[0]?.team?.id)
    const promotionRelegationRulesResponse = phaseName
      ? await $fetch<any>('/api/dhb/tournament/promotion-relegation-rules', {
          query: { name: phaseName },
        }).catch(() => null)
      : null

    const numPromoted = promotionRelegationRulesResponse?.promoted || 0
    const numRelegated = promotionRelegationRulesResponse?.relegated || 0

    const getTeamDetails = (teamId?: number) => {
      if (!teamId)
        return Promise.resolve(null)

      const key = String(teamId)
      if (!teamDetailsCache.has(key)) {
        teamDetailsCache.set(key, $fetch<any>('/api/dhb/team', {
          query: { id: teamId },
        }))
      }

      return teamDetailsCache.get(key)!
    }

    return await Promise.all(rows.map(async (row: any, index: number) => {
      const isPromoted = index < numPromoted
      const isRelegated = index >= rows.length - numRelegated

      const teamDetails = await getTeamDetails(row?.team?.id)
      const mapped = mapStandingsRow(row)

      return {
        ...mapped,
        team: {
          ...mapped.team,
          organizations: teamDetails?.club?.organizations || [],
        },
        promoted: isPromoted,
        relegated: isRelegated,
      }
    }))
  }
  catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Error fetching tournament data. (${error})`,
    })
  }
})
