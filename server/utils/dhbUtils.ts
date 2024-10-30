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
