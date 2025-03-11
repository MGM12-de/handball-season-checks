import type { EventHandler, EventHandlerRequest } from 'h3'

export function defineWrappedResponseHandler<T extends EventHandlerRequest, D>(handler: EventHandler<T, D>): EventHandler<T, D> {
  return defineEventHandler<T>(async (event) => {
    try {
      const response = await handler(event)
      return { response }
    }
    catch (err) {
      // Error handling
      return { err }
    }
  })
}

/**
 * Normalize DHB Url.
 * @param url current DHB Url
 * @returns Correct DHB Url
 */
export function normalizeDHBUrl(url: string) {
  return url.replace(/handball-net:(.*)$/, 'https://handball.net/$1')
    .replace(/^\//, 'https://handball.net/')
}

/**
 * Get base url of the DHB API
 * @returns DHB base url
 */
export function getDHBBaseUrl() {
  return 'https://www.handball.net/a/sportdata/1'
}

/**
 * Get Url for clubs
 * @returns clubs url
 */
export function getClubsUrl() {
  return `${getDHBBaseUrl()}/clubs`
}

/**
 * Get url for specific club
 * @param clubId Club id
 * @returns Club url
 */
export function getClubUrl(clubId: string) {
  return `${getClubsUrl()}/${clubId}`
}

/**
 * Get url for teams
 * @returns Teams url
 */
export function getTeamsUrl() {
  return `${getDHBBaseUrl()}/teams`
}

/**
 * Get url for specific team
 * @param teamId Team id
 * @returns Team url
 */
export function getTeamUrl(teamId: string) {
  return `${getTeamsUrl()}/${teamId}`
}

/**
 * Get url for games
 * @returns Games url
 */
export function getGamesUrl() {
  return `${getDHBBaseUrl()}/games`
}

/**
 * Get url for specific game
 * @param gameId Game id
 * @returns Game url
 */
export function getGameUrl(gameId: string) {
  return `${getGamesUrl()}/${gameId}`
}

/**
 * Get url for tournaments
 * @returns Tournaments url
 */
export function getTournamentsUrl() {
  return `${getDHBBaseUrl()}/tournaments`
}

/**
 * Get url for specific tournament
 * @param tournamentId tournament id
 * @returns tournament url
 */
export function getTournamentUrl(tournamentId: string) {
  return `${getTournamentsUrl()}/${tournamentId}`
}