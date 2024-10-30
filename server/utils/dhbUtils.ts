import type { EventHandler, EventHandlerRequest } from 'h3'

export const defineWrappedResponseHandler = <T extends EventHandlerRequest, D> (
  handler: EventHandler<T, D>
): EventHandler<T, D> =>
    defineEventHandler<T>(async (event) => {
      try {
        const response = await handler(event)
        return { response }
      } catch (err) {
      // Error handling
        return { err }
      }
    });

    /**
     * Normalize DHB Url. 
     * @param url current DHB Url
     * @returns Correct DHB Url
     */
    export const normalizeDHBUrl = (url: string) => {
      return url.replace(/handball-net:(.*)$/, 'https://handball.net/$1')
                 .replace(/^\//, 'https://handball.net/'); 
    };

    /**
     * Get base url of the DHB API
     * @returns DHB base url
     */
    export const getDHBBaseUrl = () => {
      return 'https://www.handball.net/a/sportdata/1';
    };

    /**
     * Get Url for clubs
     * @returns clubs url
     */
    export const getClubsUrl = () => {
      return `${getDHBBaseUrl()}/clubs`;
    }

    /**
     * Get url for specific club
     * @param clubId Club id
     * @returns Club url
     */
    export const getClubUrl = (clubId: string) => {
      return `${getClubsUrl()}/${clubId}`;
    }

    /**
     * Get url for teams
     * @returns Teams url
     */
    export const getTeamsUrl = () => {
      return `${getDHBBaseUrl()}/teams`;
    }

    /**
     * Get url for specific team
     * @param teamId Team id
     * @returns Team url
     */
    export const getTeamUrl = (teamId: string) => {
      return `${getTeamsUrl()}/${teamId}`;
    }
    

