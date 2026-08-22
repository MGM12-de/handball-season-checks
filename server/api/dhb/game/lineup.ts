import type { Player } from '~~/types'
import { dhbFetch, getMatchEventsUrl } from '../../../../server/utils/dhbUtils'

defineRouteMeta({
  openAPI: {
    description: 'Get game (match) lineup',
    summary: 'Get game (match) lineup',
    tags: ['Team', 'DHB', 'Game'],
    parameters: [
      {
        in: 'query',
        name: 'id',
        required: true,
        example: '545201',
        summary: 'Match id',
      },
    ],
  },
})

/**
 * NOT VERIFIED / PARTIAL: the old API's `games/{id}/lineup` (full roster +
 * officials + referees) has no identified replacement. As a best-effort
 * substitute we derive a partial roster from the live-ticker events
 * (`matches/{id}/events`) - every player who appears in at least one event,
 * with goal/sanction counts tallied from event types. Officials and
 * referees aren't derivable from events at all, so those stay empty.
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  if (!query.id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No id received',
    })
  }

  const matchId = query.id as string
  const events = await dhbFetch<any[]>(getMatchEventsUrl(matchId))

  const home = new Map<number, Player>()
  const away = new Map<number, Player>()

  const getOrCreate = (map: Map<number, Player>, player: any): Player => {
    let entry = map.get(player.id)
    if (!entry) {
      entry = {
        id: player.id,
        firstname: player.first_name,
        lastname: player.last_name,
        position: '',
        number: 0,
        goals: 0,
        penaltyGoals: 0,
        penaltyMissed: 0,
        penalties: 0,
        yellowCards: 0,
        redCards: 0,
        blueCards: 0,
        type: '',
        gamesPlayed: 1,
      }
      map.set(player.id, entry)
    }
    return entry
  }

  for (const matchEvent of events.data) {
    if (!matchEvent.player)
      continue

    const target = matchEvent.is_home ? home : away
    const player = getOrCreate(target, matchEvent.player)

    if (matchEvent.event_type?.is_goal)
      player.goals += 1
  }

  return {
    home: Array.from(home.values()),
    homeOfficials: [],
    away: Array.from(away.values()),
    awayOfficials: [],
    referees: [],
  }
})
