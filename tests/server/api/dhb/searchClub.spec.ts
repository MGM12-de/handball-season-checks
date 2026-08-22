import { createError } from 'h3'
import { beforeAll, describe, expect, it, vi } from 'vitest'

// searchClub.ts uses these as Nitro auto-imported globals, not as named
// imports from 'h3' - they must be stubbed as globals for a direct module
// import to see them (Nitro's auto-import is a build-time transform that
// doesn't apply when vitest imports the file directly).
const getValidatedQuery = vi.fn()
vi.stubGlobal('defineRouteMeta', vi.fn())
vi.stubGlobal('defineEventHandler', (handler: any) => handler)
vi.stubGlobal('createError', createError)
vi.stubGlobal('getValidatedQuery', getValidatedQuery)

// Bare `$fetch` inside this test file may resolve to a different global than
// the one production code sees (nuxt's test environment provides its own),
// so keep a single explicit reference instead of relying on it. Declared via
// vi.hoisted() so the hoisted vi.mock() factory below can see it.
const { fetchMock } = vi.hoisted(() => ({ fetchMock: vi.fn() }))
globalThis.$fetch = fetchMock as any

vi.mock('../../../../server/utils/dhbUtils', () => ({
  getClubSearchUrl: () => 'https://handball.net/api/new/teams/clubs',
  dhbFetch: (url: string, opts: any) => fetchMock(url, opts),
  normalizeImageUrl: (url: string) => url,
}))

// Dynamic import: the handler module calls defineRouteMeta() at module scope,
// so it must only be imported after the vi.stubGlobal() calls above have run.
// A static top-level `import` would be hoisted above them and throw
// "defineRouteMeta is not defined".
let handler: typeof import('../../../../server/api/dhb/searchClub')['default']

beforeAll(async () => {
  ({ default: handler } = await import('../../../../server/api/dhb/searchClub'))
})

describe('searchClub API', () => {
  it('should return club data when valid clubName is provided', async () => {
    const mockQuery = { clubName: 'SG Heuchelberg' }
    const mockClubsData = {
      success: true,
      data: [
        {
          id: 6762,
          name: 'SG Heuchelberg',
          logo: 'logo-url',
          federation: { id: 108, name: 'HB NECKAR-FRANKEN', image: 'federation-logo-url' },
        },
      ],
    }

    getValidatedQuery.mockResolvedValue(mockQuery)
    fetchMock.mockResolvedValue(mockClubsData)

    const result = await (handler as any)({})

    expect(result).toEqual([
      {
        id: 6762,
        name: 'SG Heuchelberg',
        logo: 'logo-url',
        federation: { id: 108, name: 'HB NECKAR-FRANKEN', image: 'federation-logo-url' },
        organization: { id: 108, name: 'HB NECKAR-FRANKEN', logo: 'federation-logo-url' },
      },
    ])
    expect(fetchMock).toHaveBeenCalledWith('https://handball.net/api/new/teams/clubs', {
      query: { 'all': 1, 'filter[search]': 'SG Heuchelberg' },
    })
  })

  it('should throw error when clubName is missing', async () => {
    getValidatedQuery.mockImplementation(async (_event, validator) => {
      // Simulate zod validation failure
      try {
        validator({})
      }
      catch (e: any) {
        throw createError({
          statusCode: 400,
          statusMessage: e.message,
        })
      }
    })

    await expect((handler as any)({})).rejects.toThrow()
  })
})
