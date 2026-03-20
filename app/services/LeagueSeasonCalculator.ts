import type { LeagueConfig, LeagueResult, OrganizationObject, TableRow, TeamOrganization } from '~~/types/league'

const TEAM_SUFFIX_REGEXP = /\s+(I{2,3}|IV|VI{0,3}|IX|XX?|[2-9])$/

interface RawLeague {
    config: LeagueConfig
    tables: TableRow[][]
}

export class LeagueSeasonCalculator {
    private readonly organizationScope: Set<string>

    constructor(organizationId: string) {
        this.organizationScope = LeagueSeasonCalculator.buildOrganizationScope(organizationId)
    }

    private static buildOrganizationScope(orgId: string): Set<string> {
        const scope = new Set<string>(['dhb'])

        if (!orgId)
            return scope

        let current = orgId
        scope.add(current)

        while (current.includes('-')) {
            current = current.slice(0, current.lastIndexOf('-'))
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

        for (let i = 0; i < sorted.length; i++) {
            const extra = i === 0
                ? 0
                : this.computeExtraRelegations(sorted, results, extraRelegationsTracker, i)

            extraRelegationsTracker.push(extra)

            const allPrevRelegated = i > 0
                ? [...results[i - 1]!.relegated, ...results[i - 1]!.forcedRelegations]
                : []
            const forcedRelegationTeams = this.findForcedRelegationTeams(allPrevRelegated, sorted[i]!.tables)

            results.push(this.computeLeagueResult(sorted[i]!.config, sorted[i]!.tables, extra, forcedRelegationTeams))
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

        for (const prevRow of prevAllRelegated) {
            const prevClubName = LeagueSeasonCalculator.extractClubName(prevRow.team?.name ?? '')
            if (!prevClubName)
                continue

            for (const table of currentTables) {
                for (const row of table) {
                    const rowClubName = LeagueSeasonCalculator.extractClubName(row.team?.name ?? '')
                    const rowTeamName = row.team?.name ?? ''
                    if (rowClubName === prevClubName && rowTeamName !== (prevRow.team?.name ?? '') && !forced.has(rowTeamName)) {
                        forced.set(rowTeamName, row)
                    }
                }
            }
        }

        return [...forced.values()]
    }

    /**
     * Strips the team-number suffix (2, 3, II, III, …) from a team name to get the base club name.
     * Examples: "SV Example 2" → "SV Example", "SV Example III" → "SV Example".
     */
    private static extractClubName(teamName: string): string {
        return teamName.replace(TEAM_SUFFIX_REGEXP, '').trim()
    }

    private computeLeagueResult(config: LeagueConfig, tables: TableRow[][], extraRelegations: number, forcedRelegationTeams: TableRow[] = []): LeagueResult {
        const tableCount = Math.max(tables.length, 1)
        const totalRelegatedCount = config.relegated > 0 ? config.relegated + extraRelegations : 0

        const directPromotedPerTable = Math.floor(config.promoted / tableCount)
        const promotionPlayoffSpots = config.promoted % tableCount
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
        const relegationZoneSet = new Set<TableRow>()

        const withFlags = (row: TableRow, extra?: Partial<TableRow>): TableRow => ({
            ...row,
            withdrawn: withdrawnNames.has(row.team?.name ?? ''),
            ...extra,
        })

        for (const table of tables) {
            const relegationStartIndex = Math.max(table.length - directRelegatedPerTable, 0)
            const relegationPlayoffIndex = relegationStartIndex - 1

            table.forEach((row, index) => {
                if (index < directPromotedPerTable) {
                    combinedPromoted.push(withFlags(row))
                }
                else if (promotionPlayoffSpots > 0 && index === directPromotedPerTable) {
                    combinedPromotionPlayoff.push(withFlags(row))
                }
                else if (index >= relegationStartIndex) {
                    combinedRelegated.push(withFlags(row, { relegated: true }))
                    relegationZoneSet.add(row)
                }
                else if (relegationPlayoffSpots > 0 && index === relegationPlayoffIndex) {
                    combinedRelegationPlayoff.push(withFlags(row))
                    relegationZoneSet.add(row)
                }
            })
        }

        // Apply the n-th team rule: if a higher-ranked team from the same club is relegated,
        // the lower-ranked team in this league is forced down too.
        const forcedRelegations: TableRow[] = forcedRelegationTeams
            .filter(row => !relegationZoneSet.has(row))
            .map(row => withFlags(row, { relegated: true }))

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
