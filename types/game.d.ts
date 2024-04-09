import type { Team, Location } from ".";
import type { Tournament } from "./tournament";

export interface Game {
    id: string,
    startsAt: Date,
    tournament: Tournament,
    homeTeam: Team,
    awayTeam: Team,
    field: Location,
    result?: string,
    homeGoals?: number,
    awayGoals?: number,
    goalDifference?: number,
    remarks?: string
}