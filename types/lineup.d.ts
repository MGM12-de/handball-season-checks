import type { Location, Team } from '../handball-season-checks'
import type { Officials } from './officials'
import type { Player } from './player'
import type { Referee } from './referee'
import type { Tournament } from './tournament'

export interface Lineup {
    home: Player[],
    homeOfficials: Officials[],
    away: Player[],
    awayOfficials: Officials[],
    referees: Referee[],
}
