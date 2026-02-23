import { z } from 'zod'
import { getTeamUrl, normalizeImageUrl } from '../../../../server/utils/dhbUtils'

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
        example: 'handball4all.wuerttemberg.36',
        summary: 'Team id',
      },
    ],
  },
})

export default defineCachedEventHandler(async (event) => {
  const query = await getValidatedQuery(event, data => querySchema.parse(data))
  const teamId = query.id as string

  const normalizeTeamLogo = (team) => {
    return {
      ...team,
      logo: normalizeImageUrl(team.logo),
    }
  }
  const teamApi = await $fetch(`${getTeamUrl(teamId)}/table`)
  const standings = teamApi.data.rows

  const normalizedStandings = standings.map(standing => ({
    ...standing,
    team: normalizeTeamLogo(standing.team),
  }))
  const currentTeam = normalizedStandings.find(obj => obj.team.id === query.id)
  if (currentTeam) {
    currentTeam.class = 'bg-primary-500 animate-pulse'
  }

  return normalizedStandings
}, {
  maxAge: 60 * 60, // 1 hour
  name: 'team-standing',
  swr: false,
  getKey: event => event.path,
})
