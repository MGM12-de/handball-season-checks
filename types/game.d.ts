import type { Location } from './location'
import type { Team } from './team'
import type { Tournament } from './tournament'

export interface Game {
  id: number
  startsAt: string
  tournament?: Tournament
  homeTeam: Team
  awayTeam: Team
  field?: Location
  referee?: string
  result?: string
  homeGoals?: number
  awayGoals?: number
  goalDifference?: number
  remarks?: string
  pdfUrl?: string
}
