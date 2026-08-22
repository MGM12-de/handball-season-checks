import { z } from 'zod'
import { currentRoundOnly, dhbFetch, getStandingsUrl, mapStandingsRow, resolveCurrentPhase } from '../../../../server/utils/dhbUtils'

const querySchema = z.object({
  id: z.string().min(1, 'Team ID is required'),
})

defineRouteMeta({
  openAPI: {
    description: 'Get team standings',
    summary: 'Get team standings',
    tags: ['Team', 'DHB'],
    parameters: [
      {
        in: 'query',
        name: 'id',
        required: true,
        example: '84219',
        summary: 'Team id',
      },
    ],
  },
})

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, data => querySchema.parse(data))
  const teamId = query.id as string

  const phase = await resolveCurrentPhase(teamId)
  if (!phase) {
    return []
  }

  const standings = await dhbFetch<any[]>(getStandingsUrl(), { query: { phase_id: phase.id } })
  const currentRows = currentRoundOnly(standings.data)

  const normalizedStandings = currentRows.map(mapStandingsRow)
  const currentTeam = normalizedStandings.find(obj => String(obj.team.id) === String(teamId))
  if (currentTeam) {
    currentTeam.class = 'bg-primary-500 animate-pulse'
  }

  return normalizedStandings
})
