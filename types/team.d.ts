export interface Team {
    id: string,
    teamGroupId: number,
    name: string,
    acronym: string,
    logo?: string,
    defaultTournament: {
        id: string,
        name: string,
        acronym?: string,
        logo?: string
    }
}