export interface OrganizationObject { id?: string, name?: string }
export type TeamOrganization = OrganizationObject | string

export interface OrganizationListItem {
    id: string
    name: string
    parent?: string
}

export interface LeagueConfig {
    title: string
    ids: string[]
    organization: string
    sort: number
    promoted: number
    relegated: number
}

export interface TableRow {
    team?: {
        name?: string
        logo?: string
        organizations?: TeamOrganization[]
    }
    promoted?: boolean
    relegated?: boolean
    withdrawn?: boolean
    [key: string]: unknown
}

export interface LeagueResult {
    title: string
    promoted: TableRow[]
    promotionPlayoff: TableRow[]
    promotionPlayoffSpots: number
    relegated: TableRow[]
    relegationPlayoff: TableRow[]
    relegationPlayoffSpots: number
    forcedRelegations: TableRow[]
    organization: string
}
