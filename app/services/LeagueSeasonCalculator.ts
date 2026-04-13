import type { LeagueConfig, LeagueResult, OrganizationObject, TableRow, TeamOrganization } from '~~/types/league'

const TEAM_SUFFIXES = new Set(['2', '3', '4', '5', '6', '7', '8', '9', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'])
const WHITESPACE_REGEXP = /\s+/

function distributeSpots(total: number, bucketCount: number): number[] {
  if (bucketCount <= 0)
    return []

  const safeTotal = Math.max(total, 0)
  const base = Math.floor(safeTotal / bucketCount)
  const remainder = safeTotal % bucketCount

  return Array.from({ length: bucketCount }, (_, index) => base + (index < remainder ? 1 : 0))
}

interface RawLeague {
  config: LeagueConfig
  tables: TableRow[][]
}

export class LeagueSeasonCalculator {
  private static readonly clubNameCache = new Map<string, string>()

  private readonly organizationScope: Set<string>

  constructor(organizationId: string) {
    this.organizationScope = LeagueSeasonCalculator.buildOrganizationScope(organizationId)
  }

  private static buildOrganizationScope(orgId: string): Set<string> {
    const scope = new Set<string>(['dhb'])

    if (!orgId)
      return scope

    const parts = orgId.split('-')
    let current = ''

    for (const part of parts) {
      current = current ? `${current}-${part}` : part
      scope.add(current)
    }

    return scope
  }

  filterConfigs(configs: LeagueConfig[]): LeagueConfig[] {
    return configs.filter(config => this.organizationScope.has(config.organization))
  }

  calculate(rawLeagues: RawLeague[]): LeagueResult[] {
    const sorted = rawLeagues.toSorted((a, b) => a.config.sort - b.config.sort)
    const results: LeagueResult[] = []
    const extraRelegationsTracker: number[] = []

    const lastIndex = sorted.length - 1

    for (let i = 0; i < sorted.length; i++) {
      const isLowestLeague = i === lastIndex

      const extra = (i === 0 || isLowestLeague)
        ? 0
        : this.computeExtraRelegations(sorted, results, extraRelegationsTracker, i)

      extraRelegationsTracker.push(extra)

      const allPrevRelegated = (i > 0 && !isLowestLeague)
        ? [...results[i - 1]!.relegated, ...results[i - 1]!.forcedRelegations]
        : []
      const forcedRelegationTeams = this.findForcedRelegationTeams(allPrevRelegated, sorted[i]!.tables)
      const blockedPromotionTeams = this.findBlockedPromotionTeams(sorted, results, i)

      results.push(this.computeLeagueResult(sorted[i]!.config, sorted[i]!.tables, extra, forcedRelegationTeams, blockedPromotionTeams))
    }

    return results
  }

  private computeExtraRelegations(
    sorted: RawLeague[],
    results: LeagueResult[],
    extraRelegationsTracker: number[],
    i: number,
  ): number {
    const current = sorted[i]!
    const prev = sorted[i - 1]!
    const prevResult = results[i - 1]!
    const allPrevRelegated = [...prevResult.relegated, ...prevResult.forcedRelegations]

    if (prev.config.organization !== current.config.organization) {
      return allPrevRelegated.filter((row) => {
        const orgs = row.team?.organizations ?? []
        return orgs.some(org => LeagueSeasonCalculator.matchesOrganization(org, current.config.organization))
      }).length
    }

    return (extraRelegationsTracker[i - 1] ?? 0) + prevResult.relegationPlayoffSpots
  }

  /**
   * Finds teams in the current league that belong to the same club as a relegated team
   * from the league above and are therefore forced to relegate (n-th team rule).
   */
  private findForcedRelegationTeams(prevAllRelegated: TableRow[], currentTables: TableRow[][]): TableRow[] {
    const forced = new Map<string, TableRow>()

    const rowsByClubName = new Map<string, TableRow[]>()
    for (const table of currentTables) {
      for (const row of table) {
        const rowTeamName = row.team?.name ?? ''
        if (!rowTeamName)
          continue

        const rowClubName = LeagueSeasonCalculator.extractClubName(rowTeamName)
        if (!rowClubName)
          continue

        const rows = rowsByClubName.get(rowClubName) ?? []
        rows.push(row)
        rowsByClubName.set(rowClubName, rows)
      }
    }

    for (const prevRow of prevAllRelegated) {
      const prevTeamName = prevRow.team?.name ?? ''
      const prevClubName = LeagueSeasonCalculator.extractClubName(prevTeamName)
      if (!prevClubName)
        continue

      const candidates = rowsByClubName.get(prevClubName) ?? []
      for (const row of candidates) {
        const rowTeamName = row.team?.name ?? ''
        if (rowTeamName && rowTeamName !== prevTeamName && !forced.has(rowTeamName))
          forced.set(rowTeamName, row)
      }
    }

    return [...forced.values()]
  }

  private findBlockedPromotionTeams(sorted: RawLeague[], results: LeagueResult[], leagueIndex: number): TableRow[] {
    if (leagueIndex === 0)
      return []

    const occupiedClubNames = this.getOccupiedHigherLeagueClubNames(sorted, results, leagueIndex - 1)
    if (!occupiedClubNames.size)
      return []

    return sorted[leagueIndex]!.tables
      .flat()
      .filter((row) => {
        const clubName = LeagueSeasonCalculator.extractClubName(row.team?.name ?? '')
        return !!clubName && occupiedClubNames.has(clubName)
      })
  }

  private getOccupiedHigherLeagueClubNames(sorted: RawLeague[], results: LeagueResult[], higherLeagueIndex: number): Set<string> {
    const higherLeague = sorted[higherLeagueIndex]!
    const higherLeagueResult = results[higherLeagueIndex]!
    const leavingTeamNames = new Set([
      ...higherLeagueResult.promoted,
      ...higherLeagueResult.relegated,
      ...higherLeagueResult.forcedRelegations,
    ].map(row => row.team?.name ?? '').filter(Boolean))
    const occupiedClubNames = new Set<string>()

    for (const table of higherLeague.tables) {
      for (const row of table) {
        const teamName = row.team?.name ?? ''
        if (leavingTeamNames.has(teamName))
          continue

        const clubName = LeagueSeasonCalculator.extractClubName(teamName)
        if (clubName)
          occupiedClubNames.add(clubName)
      }
    }

    for (const row of this.getIncomingRelegations(sorted, results, higherLeagueIndex)) {
      const clubName = LeagueSeasonCalculator.extractClubName(row.team?.name ?? '')
      if (clubName)
        occupiedClubNames.add(clubName)
    }

    return occupiedClubNames
  }

  private getIncomingRelegations(sorted: RawLeague[], results: LeagueResult[], leagueIndex: number): TableRow[] {
    if (leagueIndex === 0)
      return []

    const sourceLeague = sorted[leagueIndex - 1]!
    const targetLeague = sorted[leagueIndex]!
    const sourceResult = results[leagueIndex - 1]!
    const relegatedTeams = [...sourceResult.relegated, ...sourceResult.forcedRelegations]

    if (sourceLeague.config.organization === targetLeague.config.organization)
      return relegatedTeams

    return relegatedTeams.filter((row) => {
      const organizations = row.team?.organizations ?? []
      return organizations.some(org => LeagueSeasonCalculator.matchesOrganization(org, targetLeague.config.organization))
    })
  }

  /**
   * Strips the team-number suffix (2, 3, II, III, …) from a team name to get the base club name.
   * Examples: "SV Example 2" → "SV Example", "SV Example III" → "SV Example".
   */
  private static extractClubName(teamName: string): string {
    const normalizedTeamName = teamName.trim()
    if (!normalizedTeamName)
      return ''

    const cachedClubName = this.clubNameCache.get(normalizedTeamName)
    if (cachedClubName !== undefined)
      return cachedClubName

    const parts = normalizedTeamName.split(WHITESPACE_REGEXP)
    const suffix = parts.at(-1)

    const clubName = (parts.length > 1 && suffix && TEAM_SUFFIXES.has(suffix))
      ? parts.slice(0, -1).join(' ')
      : normalizedTeamName

    this.clubNameCache.set(normalizedTeamName, clubName)

    return clubName
  }

  private computeLeagueResult(
    config: LeagueConfig,
    tables: TableRow[][],
    extraRelegations: number,
    forcedRelegationTeams: TableRow[] = [],
    blockedPromotionTeams: TableRow[] = [],
  ): LeagueResult {
    const tableCount = Math.max(tables.length, 1)
    const totalRelegatedCount = config.relegated > 0 ? config.relegated + extraRelegations : 0

    const hasExplicitPromotionPlayoff = typeof config.promotionPlayoff === 'number'
    const directPromotedCount = hasExplicitPromotionPlayoff
      ? Math.max(config.promoted, 0)
      : Math.floor(config.promoted / tableCount) * tableCount
    const promotionPlayoffSpots = hasExplicitPromotionPlayoff
      ? Math.max(config.promotionPlayoff ?? 0, 0)
      : config.promoted % tableCount
    const directPromotedByTable = distributeSpots(directPromotedCount, tableCount)
    const promotionPlayoffByTable = distributeSpots(promotionPlayoffSpots, tableCount)
    const directRelegatedPerTable = Math.floor(totalRelegatedCount / tableCount)
    const relegationPlayoffSpots = totalRelegatedCount % tableCount

    // Detect withdrawn teams: 0 games played while most teams in the table have already played.
    const withdrawnNames = new Set<string>()
    for (const table of tables) {
      const playedCount = table.filter(r => (r.games as number ?? 0) > 0).length
      if (playedCount > table.length / 2) {
        for (const row of table) {
          if ((row.games as number ?? 0) === 0)
            withdrawnNames.add(row.team?.name ?? '')
        }
      }
    }

    const combinedPromoted: TableRow[] = []
    const combinedPromotionPlayoff: TableRow[] = []
    const combinedRelegated: TableRow[] = []
    const combinedRelegationPlayoff: TableRow[] = []
    const blockedPromotionTeamNames = new Set(blockedPromotionTeams.map(row => row.team?.name ?? '').filter(Boolean))
    const rowToTableIndex = new Map<TableRow, number>()
    const relegatedByTable = new Map<number, TableRow[]>()
    const sourceRowsInRelegation = new Set<TableRow>()
    const sourceRowsInPromotion = new Set<TableRow>()
    const sourceRowsInPromotionPlayoff = new Set<TableRow>()
    const playoffByTable = new Map<number, TableRow>()
    const sourceToPlayoffRow = new Map<TableRow, TableRow>()

    const withFlags = (row: TableRow, extra?: Partial<TableRow>): TableRow => ({
      ...row,
      withdrawn: withdrawnNames.has(row.team?.name ?? ''),
      ...extra,
    })

    for (const [tableIndex, table] of tables.entries()) {
      const directPromotedInTable = directPromotedByTable[tableIndex] ?? 0
      const promotionPlayoffInTable = promotionPlayoffByTable[tableIndex] ?? 0
      const promotionPlayoffEndIndex = directPromotedInTable + promotionPlayoffInTable
      const relegationStartIndex = Math.max(table.length - directRelegatedPerTable, 0)
      const relegationPlayoffIndex = relegationStartIndex - 1

      table.forEach((row, index) => {
        rowToTableIndex.set(row, tableIndex)

        if (index < directPromotedInTable) {
          const promotedRow = withFlags(row, blockedPromotionTeamNames.has(row.team?.name ?? '') ? { promotionBlocked: true } : undefined)
          combinedPromoted.push(promotedRow)
          sourceRowsInPromotion.add(row)
        }
        else if (promotionPlayoffInTable > 0 && index < promotionPlayoffEndIndex) {
          const promotionPlayoffRow = withFlags(row, blockedPromotionTeamNames.has(row.team?.name ?? '') ? { promotionBlocked: true } : undefined)
          combinedPromotionPlayoff.push(promotionPlayoffRow)
          sourceRowsInPromotionPlayoff.add(row)
        }
        else if (index >= relegationStartIndex) {
          const relegatedRow = withFlags(row, { relegated: true })
          combinedRelegated.push(relegatedRow)
          const relegatedInTable = relegatedByTable.get(tableIndex) ?? []
          relegatedInTable.push(relegatedRow)
          relegatedByTable.set(tableIndex, relegatedInTable)
          sourceRowsInRelegation.add(row)
        }
        else if (relegationPlayoffSpots > 0 && index === relegationPlayoffIndex) {
          const playoffRow = withFlags(row)
          combinedRelegationPlayoff.push(playoffRow)
          playoffByTable.set(tableIndex, playoffRow)
          sourceToPlayoffRow.set(row, playoffRow)
        }
      })
    }

    // Apply the n-th team rule: if a higher-ranked team from the same club is relegated,
    // the lower-ranked team in this league is forced down too. One positional relegation
    // from the same table is reprieved to keep the overall number of relegations unchanged.
    const forcedRelegations: TableRow[] = []

    for (const forcedSourceRow of forcedRelegationTeams) {
      // A team that would be promoted cannot be a forced relegation.
      // It stays listed as promoted/promotion-playoff.
      if (sourceRowsInPromotion.has(forcedSourceRow) || sourceRowsInPromotionPlayoff.has(forcedSourceRow))
        continue

      if (sourceRowsInRelegation.has(forcedSourceRow))
        continue

      const tableIndex = rowToTableIndex.get(forcedSourceRow)
      if (tableIndex === undefined)
        continue

      const existingPlayoffRow = sourceToPlayoffRow.get(forcedSourceRow)
      if (existingPlayoffRow) {
        const existingPlayoffIndex = combinedRelegationPlayoff.indexOf(existingPlayoffRow)
        if (existingPlayoffIndex >= 0)
          combinedRelegationPlayoff.splice(existingPlayoffIndex, 1)
      }

      forcedRelegations.push(withFlags(forcedSourceRow, { relegated: true }))

      const relegatedInSameTable = relegatedByTable.get(tableIndex) ?? []
      const reprievedRow = relegatedInSameTable.shift()

      if (!reprievedRow)
        continue

      const reprievedIndex = combinedRelegated.indexOf(reprievedRow)
      if (reprievedIndex >= 0)
        combinedRelegated.splice(reprievedIndex, 1)

      if (relegationPlayoffSpots > 0) {
        const currentPlayoff = playoffByTable.get(tableIndex)
        if (currentPlayoff) {
          const playoffIndex = combinedRelegationPlayoff.indexOf(currentPlayoff)
          if (playoffIndex >= 0)
            combinedRelegationPlayoff.splice(playoffIndex, 1, reprievedRow)
          playoffByTable.set(tableIndex, reprievedRow)
        }
        else {
          combinedRelegationPlayoff.push(reprievedRow)
          playoffByTable.set(tableIndex, reprievedRow)
        }
      }
    }

    return {
      title: config.title,
      promoted: combinedPromoted,
      promotionPlayoff: combinedPromotionPlayoff,
      promotionPlayoffSpots,
      relegated: combinedRelegated,
      relegationPlayoff: combinedRelegationPlayoff,
      relegationPlayoffSpots,
      forcedRelegations,
      organization: config.organization,
    }
  }

  static isOrganizationObject(org: TeamOrganization): org is OrganizationObject {
    return typeof org !== 'string'
  }

  static matchesOrganization(org: TeamOrganization, leagueOrg: string): boolean {
    if (typeof org === 'string')
      return org === leagueOrg
    return org.id === leagueOrg || org.name === leagueOrg
  }

  static getForeignOrganizations(orgs: TeamOrganization[] | undefined, leagueOrg: string): OrganizationObject[] {
    return (orgs ?? [])
      .filter(LeagueSeasonCalculator.isOrganizationObject)
      .filter(org => org.id !== leagueOrg)
  }
}
