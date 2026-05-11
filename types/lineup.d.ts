import type { Officials } from './officials'
import type { Player } from './player'
import type { Referee } from './referee'

export interface Lineup {
  home: Player[]
  homeOfficials: Officials[]
  away: Player[]
  awayOfficials: Officials[]
  referees: Referee[]
}
