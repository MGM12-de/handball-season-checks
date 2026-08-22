import { z } from 'zod'
import { currentRoundOnly, dhbFetch, getMatchesUrl, getStandingsUrl, mapStandingsRow } from '../../../../server/utils/dhbUtils'

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

/**
 * The new API has no "standings for this team" endpoint - standings are only
 * reachable via `phase_id`. We derive the team's current phase from one of
 * its matches first, then fetch the standings for that phase.
 */
async function resolveCurrentPhaseId(teamId: string): Promise<number | undefined> {
  const matches = await dhbFetch<any[]>(getMatchesUrl(), { query: { team_id: teamId, page: 1 } })
  const withStandings = matches.data.find(match => match.phase?.has_standings)
  return (withStandings ?? matches.data[0])?.phase?.id
}

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, data => querySchema.parse(data))
  const teamId = query.id as string

  const phaseId = await resolveCurrentPhaseId(teamId)
  if (!phaseId) {
    return []
  }

  const standings = await dhbFetch<any[]>(getStandingsUrl(), { query: { phase_id: phaseId } })
  const currentRows = currentRoundOnly(standings.data)

  const normalizedStandings = currentRows.map(mapStandingsRow)
  const currentTeam = normalizedStandings.find(obj => String(obj.team.id) === String(teamId))
  if (currentTeam) {
    currentTeam.class = 'bg-primary-500 animate-pulse'
  }

  return normalizedStandings
})
