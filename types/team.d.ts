import type { TeamOrganization } from './league'

export interface Club {
  id: number
  name: string
  logo?: string
  organization?: { id: number, name: string, logo?: string }
  organizations?: TeamOrganization[]
}

export interface Team {
  id: number
  name: string
  logo?: string
  club?: Club
  gender?: { id: string, name: string }
  ageCategory?: { id: number, name: string }
}
