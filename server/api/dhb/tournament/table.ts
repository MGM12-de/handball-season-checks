import { z } from 'zod'
import { getTournamentUrl, normalizeImageUrl } from '../../../../server/utils/dhbUtils'

const querySchema = z.object({
  id: z.string().min(1, 'Tournament ID is required'),
  phase: z.string().optional(),
})

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

export default defineEventHandler(async (event): Promise<any[]> => {
  // https://www.handball.net/a/sportdata/1/tournaments/handball4all.wuerttemberg.126171
  const query = await getValidatedQuery(event, data => querySchema.parse(data))
  const teamDetailsCache = new Map<string, Promise<any>>()

  const promotionRelegationRulesResponse: any = await $fetch<any>(
    `/api/dhb/tournament/promotion-relegation-rules`,
    {
      query: {
        id: query.id,
      },
    },
  ).catch(() => null)

  try {
    const tournamentTable: any = await $fetch<any>(`${getTournamentUrl(query.id)}/table`, {
      query: {
        phase: query.phase,
      },
    })

    const rows: any[] = tournamentTable.data?.rows || []

    const numPromoted = promotionRelegationRulesResponse?.promoted || 0
    const numRelegated = promotionRelegationRulesResponse?.relegated || 0

    const getTeamDetails = (teamId?: string) => {
      if (!teamId)
        return Promise.resolve(null)

      if (!teamDetailsCache.has(teamId)) {
        teamDetailsCache.set(teamId, $fetch<any>('/api/dhb/team', {
          query: { id: teamId },
        }))
      }

      return teamDetailsCache.get(teamId)!
    }

    return await Promise.all(rows.map(async (row: any, index: number) => {
      const isPromoted = index < numPromoted
      const isRelegated = index >= rows.length - numRelegated

      const teamDetails = await getTeamDetails(row?.team?.id)

      return {
        ...row,
        team: {
          ...row.team,
          logo: row.team?.logo ? normalizeImageUrl(row.team.logo) : row.team?.logo,
          organizations: teamDetails?.club?.organizations || [],
        },
        promoted: isPromoted,
        relegated: isRelegated,
      }
    }))
  }
  catch (error) {
    // Handle potential errors from $fetch
    throw createError({
      statusCode: 500,
      statusMessage: `Error fetching tournament data. (${error})`,
    })
  }
})
