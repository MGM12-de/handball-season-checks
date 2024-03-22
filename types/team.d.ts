import type { Tournament } from "./tournament";

export interface Team {
    id: string,
    teamGroupId: number,
    name: string,
    acronym: string,
    logo?: string,
    defaultTournament?: Tournament
}