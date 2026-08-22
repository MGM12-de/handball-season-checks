/**
 * A "tournament" in this app now maps to a handball.net "phase" (a concrete
 * Staffel/group within a league level, e.g. "M-BOL-1-NF"). The new API has no
 * single name/logo lookup for this concept - see server/api/dhb/tournament/index.ts.
 */
export interface Tournament {
  id: number
  name: string
  acronym?: string
  logo?: string
  competition?: { id: number, name: string }
}
