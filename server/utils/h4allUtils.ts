/**
 * Adapter for handball4all.de's legacy "spo" JSON service.
 *
 * There is no official documentation for this endpoint - the query params and
 * response shape below are reverse-engineered from a previous, now-archived
 * integration (TSV-Willsbach/hand-middleware). Treat everything here as BEST
 * EFFORT until it has been verified against the live service.
 *
 * A league is addressed by two values from H4All's own data model: `og`
 * (Objektgruppe - the regional association owning the data) and `cl`
 * (the competition/class id). Both are opaque numeric ids assigned by H4All,
 * so a league config's `ids` entries for this source use the compact form
 * "<og>:<cl>" (colon-separated, so the id stays safe to interpolate into a
 * manually built query string - unlike the DHB ids, which already contain
 * unescaped "&" in at least one config and rely on that being tolerated).
 */
export function getH4AllBaseUrl() {
  const runtimeConfig = useRuntimeConfig()
  return runtimeConfig.public.h4allBaseUrl
}

export function parseH4AllLeagueId(id: string): { og: string, classId: string } {
  const [og, classId] = id.split(':')

  if (!og || !classId) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid H4All league id "${id}" - expected format "<og>:<classId>"`,
    })
  }

  return { og, classId }
}

export function getH4AllLeagueUrl(og: string | number, classId: string | number) {
  return `${getH4AllBaseUrl()}?ca=1&og=${og}&cmd=ps&cl=${classId}`
}

/**
 * Fetch a league (games + table) from H4All.
 *
 * The service responds with a single-element array wrapping the league
 * object, e.g. `[{ head: {...}, content: { futureGames: {...}, score: [...] } }]`.
 * Some responses instead put `games`/`gClassID` directly on the element
 * (no `content` wrapper) - see extractGames()/extractScores() below, which
 * handle both shapes.
 */
export async function fetchH4AllLeague(id: string): Promise<any> {
  const { og, classId } = parseH4AllLeagueId(id)
  const url = getH4AllLeagueUrl(og, classId)

  const response = await $fetch<any[]>(url)
  const raw = response?.[0]

  if (!raw) {
    throw createError({
      statusCode: 502,
      statusMessage: 'H4All returned an empty response',
    })
  }

  return raw
}

export function extractGames(raw: any): any[] {
  return raw?.content?.futureGames?.games ?? raw?.games ?? []
}

export function extractScores(raw: any): any[] {
  return raw?.content?.score ?? raw?.score ?? []
}

export function getReportBaseUrl(raw: any): string | undefined {
  return raw?.head?.repURL
}

/**
 * H4All dates are "dd.mm.yy"/"dd.mm.yyyy" with a separate "hh:mm" time -
 * reformat to the same "<localized date>, <localized time>" shape the DHB
 * adapter produces (see server/api/dhb/team/games.ts) so both sources render
 * identically in the UI.
 */
export function parseH4AllDate(date?: string, time?: string): string | undefined {
  if (!date)
    return undefined

  const match = date.match(/^(\d{2})\.(\d{2})\.(\d{2,4})$/)
  if (!match)
    return undefined

  const [, day, month, yearPart] = match
  const year = yearPart!.length === 2 ? `20${yearPart}` : yearPart!
  const [hour, minute] = (time ?? '').split(':')

  const parsed = new Date(Number(year), Number(month) - 1, Number(day), Number(hour) || 0, Number(minute) || 0)
  if (Number.isNaN(parsed.getTime()))
    return undefined

  const localizedDate = parsed.toLocaleDateString('de')
  if (!time)
    return localizedDate

  return `${localizedDate}, ${parsed.toLocaleTimeString('de', { hour: '2-digit', minute: '2-digit' })}`
}

function toNumberOrUndefined(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '')
    return undefined

  const num = Number(value)
  return Number.isNaN(num) ? undefined : num
}

/**
 * Map a raw H4All game entry to this app's Game shape.
 *
 * H4All only carries team *names* on a game (gHomeTeam/gGuestTeam are
 * strings), not team ids - unlike the DHB source, there is no stable id to
 * key a team by here, so `homeTeam.id`/`awayTeam.id` fall back to the name.
 */
export function mapH4AllGame(raw: any, reportBaseUrl?: string) {
  const homeGoals = toNumberOrUndefined(raw.gHomeGoals)
  const awayGoals = toNumberOrUndefined(raw.gGuestGoals)
  const hasResult = homeGoals !== undefined && awayGoals !== undefined

  const startsAt = parseH4AllDate(raw.gDate, raw.gTime) ?? raw.gDate

  const reportId = toNumberOrUndefined(raw.sGID)

  return {
    id: raw.gID,
    startsAt,
    homeTeam: { id: raw.gHomeTeam, name: raw.gHomeTeam },
    awayTeam: { id: raw.gGuestTeam, name: raw.gGuestTeam },
    result: hasResult ? `${homeGoals}:${awayGoals}` : undefined,
    homeGoals,
    awayGoals,
    goalDifference: hasResult ? homeGoals! - awayGoals! : undefined,
    field: raw.gGymnasiumName
      ? {
          id: String(raw.gGymnasiumID ?? raw.gGymnasiumNo ?? ''),
          name: raw.gGymnasiumName,
        }
      : undefined,
    referee: raw.gReferee || undefined,
    remarks: raw.gComment || undefined,
    pdfUrl: reportId && reportBaseUrl ? `${reportBaseUrl}${reportId}` : undefined,
  }
}

/**
 * Map a raw H4All score/table row to this app's TableRow shape
 * (see standingTable.vue / mapStandingsRow() in dhbUtils.ts for the fields
 * consumers expect).
 *
 * `points` is rendered as the classic German "Pluspunkte:Minuspunkte"
 * string (e.g. "34:10") rather than a single number - team/prognosis.ts
 * already parses that format for the DHB source, so this stays consistent.
 */
export function mapH4AllStandingsRow(raw: any) {
  const goalsFor = toNumberOrUndefined(raw.numGoalsShot) ?? 0
  const goalsAgainst = toNumberOrUndefined(raw.numGoalsGot) ?? 0
  const pointsPlus = toNumberOrUndefined(raw.pointsPlus) ?? 0
  const pointsMinus = toNumberOrUndefined(raw.pointsMinus) ?? 0

  return {
    rank: toNumberOrUndefined(raw.tabScore),
    games: toNumberOrUndefined(raw.numPlayedGames) ?? 0,
    wins: toNumberOrUndefined(raw.numWonGames) ?? 0,
    draws: toNumberOrUndefined(raw.numEqualGames) ?? 0,
    losses: toNumberOrUndefined(raw.numLostGames) ?? 0,
    goals: goalsFor,
    goalsAgainst,
    goalDifference: goalsFor - goalsAgainst,
    points: `${pointsPlus}:${pointsMinus}`,
    team: {
      id: raw.tabTeamID,
      name: raw.tabTeamname,
    },
  }
}
