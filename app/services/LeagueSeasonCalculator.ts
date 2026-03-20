import type { LeagueConfig, LeagueResult, OrganizationObject, TableRow, TeamOrganization } from '~~/types/league'

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
            results.push(this.computeLeagueResult(sorted[i]!.config, sorted[i]!.tables, extra))
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

        if (prev.config.organization !== current.config.organization) {
            return prevResult.relegated.filter((row) => {
                const orgs = row.team?.organizations ?? []
                return orgs.some(org => LeagueSeasonCalculator.matchesOrganization(org, current.config.organization))
            }).length
        }

        return (extraRelegationsTracker[i - 1] ?? 0) + prevResult.relegationPlayoffSpots
    }

    private computeLeagueResult(config: LeagueConfig, tables: TableRow[][], extraRelegations: number): LeagueResult {
        const tableCount = Math.max(tables.length, 1)
        const totalRelegatedCount = config.relegated > 0 ? config.relegated + extraRelegations : 0

        const directPromotedPerTable = Math.floor(config.promoted / tableCount)
        const promotionPlayoffSpots = config.promoted % tableCount
        const directRelegatedPerTable = Math.floor(totalRelegatedCount / tableCount)
        const relegationPlayoffSpots = totalRelegatedCount % tableCount

        const combinedPromoted: TableRow[] = []
        const combinedPromotionPlayoff: TableRow[] = []
        const combinedRelegated: TableRow[] = []
        const combinedRelegationPlayoff: TableRow[] = []

        for (const table of tables) {
            const relegationStartIndex = Math.max(table.length - directRelegatedPerTable, 0)
            const relegationPlayoffIndex = relegationStartIndex - 1

            table.forEach((row, index) => {
                if (index < directPromotedPerTable) {
                    combinedPromoted.push(row)
                }
                else if (promotionPlayoffSpots > 0 && index === directPromotedPerTable) {
                    combinedPromotionPlayoff.push(row)
                }
                else if (index >= relegationStartIndex) {
                    combinedRelegated.push({ ...row, relegated: true })
                }
                else if (relegationPlayoffSpots > 0 && index === relegationPlayoffIndex) {
                    combinedRelegationPlayoff.push(row)
                }
            })
        }

        return {
            title: config.title,
            promoted: combinedPromoted,
            promotionPlayoff: combinedPromotionPlayoff,
            promotionPlayoffSpots,
            relegated: combinedRelegated,
            relegationPlayoff: combinedRelegationPlayoff,
            relegationPlayoffSpots,
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
