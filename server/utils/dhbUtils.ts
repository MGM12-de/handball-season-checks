import type { EventHandler, EventHandlerRequest } from 'h3'

export function defineWrappedResponseHandler<T extends EventHandlerRequest, D>(handler: EventHandler<T, D>): EventHandler<T, D> {
  return defineEventHandler<T>(async (event) => {
    try {
      const response = await handler(event)
      return { response }
    }
    catch (err) {
      // Error handling
      return { err }
    }
  })
}

/**
 * Normalize Image Url.
 * @param url current Image Url
 * @returns Correct Image Url
 */
export function normalizeImageUrl(url: string) {
  return url.replace(/handball-net:(.*)$/, 'https://handball.net/$1')
    .replace(/^\//, 'https://handball.net/')
}

/**
 * Get base url of the handball.net API
 * @returns handball.net base url
 */
export function getDHBBaseUrl() {
  const runtimeConfig = useRuntimeConfig()
  return runtimeConfig.public.dhbBaseUrl
}

export interface DHBEnvelope<T> {
  success?: boolean
  data: T
  meta?: { request_id: string, timestamp: string }
  pagination?: {
    current_page: number
    per_page: number
    total: number
    last_page: number
    from: number
    to: number
  }
}

/**
 * Fetch from the handball.net API.
 *
 * Every endpoint requires a `Referer` header containing `https://www.handball.net`,
 * otherwise it answers 403 (the exact path doesn't seem to matter).
 *
 * The response envelope's `success` field is not always present (e.g.
 * `matches/{id}/events` only returns `{ data: [...] }`), so only an explicit
 * `success: false` is treated as an error - absence of the field is not.
 */
export async function dhbFetch<T = any>(url: string, opts: Record<string, any> = {}): Promise<DHBEnvelope<T>> {
  const envelope = await $fetch<DHBEnvelope<T>>(url, {
    ...opts,
    headers: {
      Referer: 'https://www.handball.net/',
      ...opts.headers,
    },
  })

  if (envelope && (envelope as any).success === false) {
    throw createError({
      statusCode: 502,
      statusMessage: 'handball.net API returned an unsuccessful response',
    })
  }

  return envelope
}

/**
 * Fetch every page of a paginated handball.net endpoint and concatenate `data`.
 * Safe to use on endpoints that already return everything on a single page
 * (pagination.last_page will simply be 1).
 */
export async function dhbFetchAllPages<T = any>(url: string, query: Record<string, any> = {}, maxPages = 20): Promise<T[]> {
  const results: T[] = []
  let page = 1

  while (page <= maxPages) {
    const envelope = await dhbFetch<T[]>(url, { query: { ...query, page } })
    results.push(...(envelope.data ?? []))

    const lastPage = envelope.pagination?.last_page ?? 1
    if (page >= lastPage)
      break

    page += 1
  }

  return results
}

/**
 * Collection url for club search, e.g. `?all=1&filter[search]=`.
 */
export function getClubSearchUrl() {
  return `${getDHBBaseUrl()}/teams/clubs`
}

/**
 * Url for a single club.
 *
 * BEST EFFORT: the handball.net API migration notes only document the club
 * search* endpoint (`/teams/clubs?all=1&filter[search]=`). A single-club-by-id
 * endpoint is not documented; this follows the same REST convention as
 * `/teams/{id}` for a single team and is unverified against the live API.
 */
export function getClubUrl(clubId: number | string) {
  return `${getClubSearchUrl()}/${clubId}`
}

export function getTeamsUrl() {
  return `${getDHBBaseUrl()}/teams`
}

export function getTeamUrl(teamId: number | string) {
  return `${getTeamsUrl()}/${teamId}`
}

export function getMatchesUrl() {
  return `${getDHBBaseUrl()}/matches`
}

export function getMatchEventsUrl(matchId: number | string) {
  return `${getMatchesUrl()}/${matchId}/events`
}

export function getStandingsUrl() {
  return `${getDHBBaseUrl()}/standings`
}

export function getCompetitionsUrl() {
  return `${getDHBBaseUrl()}/competitions`
}

export function getPhasesUrl() {
  return `${getDHBBaseUrl()}/phases`
}

export function getPlayerStatsUrl() {
  return `${getDHBBaseUrl()}/stats/player-stats`
}

/**
 * Fetch every page of a club's teams. The new API requires `federation_id`
 * alongside `club_id` - without it the endpoint returns no/wrong results, so
 * we resolve it from the club itself first.
 */
export async function fetchTeamsForClub(clubId: string | number) {
  let federationId: number | undefined

  try {
    const club = await dhbFetch<any>(getClubUrl(clubId))
    federationId = club.data?.federation?.id
  }
  catch {
    // BEST EFFORT: club-by-id isn't a confirmed endpoint (see getClubUrl).
    // Fall back to fetching teams without federation_id below rather than failing outright.
  }

  return dhbFetchAllPages<any>(getTeamsUrl(), {
    club_id: clubId,
    ...(federationId ? { federation_id: federationId } : {}),
  })
}

/**
 * Map a raw handball.net standings row (from `/standings?phase_id=`) to the
 * shape this app's UI (standingTable.vue, LeagueSeasonCalculator) expects.
 */
export function mapStandingsRow(row: any) {
  return {
    ...row,
    rank: row.position,
    games: row.played,
    wins: row.won,
    draws: row.drawn,
    losses: row.lost,
    goals: row.goals_for,
    goalsAgainst: row.goals_against,
    goalDifference: row.goals_diff,
    team: row.team
      ? {
          ...row.team,
          logo: row.team.club?.logo ? normalizeImageUrl(row.team.club.logo) : row.team.club?.logo,
        }
      : row.team,
  }
}

/**
 * Standings are not paginated but list one row per team *and* per round
 * (the whole season's history). Filter down to the highest round number to
 * get the current table.
 */
export function currentRoundOnly(rows: any[]) {
  if (rows.length === 0)
    return rows

  const maxRound = Math.max(...rows.map(row => row.round ?? 0))
  return rows.filter(row => (row.round ?? 0) === maxRound)
}
