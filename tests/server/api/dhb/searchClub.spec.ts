import { describe, expect, it, vi } from 'vitest'
import { createError } from 'h3'

// Mocking Nuxt/Nitro globals
vi.stubGlobal('defineRouteMeta', vi.fn())
vi.stubGlobal('defineEventHandler', (handler: any) => handler)

// Mocking h3 and other dependencies
vi.mock('h3', async () => {
  const actual = await vi.importActual('h3')
  return {
    ...actual as any,
    getValidatedQuery: vi.fn(),
  }
})

vi.mock('../../../../server/utils/dhbUtils', () => ({
  getClubsUrl: () => 'https://api.handball.net/clubs',
  normalizeImageUrl: (url: string) => url,
}))

global.$fetch = vi.fn() as any

import handler from '../../../../server/api/dhb/searchClub'
import { getValidatedQuery } from 'h3'

describe('searchClub API', () => {
  it('should return club data when valid clubName is provided', async () => {
    const mockQuery = { clubName: 'THW Kiel' }
    const mockClubsData = {
      data: [
        {
          logo: 'logo-url',
          organization: { logo: 'org-logo-url' },
        },
      ],
    }

    vi.mocked(getValidatedQuery).mockResolvedValue(mockQuery)
    vi.mocked($fetch).mockResolvedValue(mockClubsData)

    const result = await (handler as any)({})

    expect(result).toEqual(mockClubsData.data)
    expect($fetch).toHaveBeenCalledWith('https://api.handball.net/clubs/search', {
      query: { query: 'THW Kiel' },
    })
  })

  it('should throw error when clubName is missing', async () => {
    vi.mocked(getValidatedQuery).mockImplementation(async (_event, validator) => {
      // Simulate zod validation failure
      try {
          validator({})
      } catch (e: any) {
          throw createError({
              statusCode: 400,
              statusMessage: e.message,
          })
      }
    })

    await expect((handler as any)({})).rejects.toThrow()
  })
})
