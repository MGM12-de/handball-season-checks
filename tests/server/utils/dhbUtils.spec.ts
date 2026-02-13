import { describe, expect, it } from 'vitest'
import { getClubUrl, getDHBBaseUrl, normalizeImageUrl } from '../../../server/utils/dhbUtils'

describe('dhbUtils', () => {
  describe('normalizeImageUrl', () => {
    it('should replace handball-net: prefix', () => {
      const url = 'handball-net:some/image.jpg'
      expect(normalizeImageUrl(url)).toBe('https://handball.net/some/image.jpg')
    })

    it('should add base URL for paths starting with /', () => {
      const url = '/another/image.png'
      expect(normalizeImageUrl(url)).toBe('https://handball.net/another/image.png')
    })

    it('should not change already correct URLs', () => {
      const url = 'https://handball.net/a/valid/url.gif'
      expect(normalizeImageUrl(url)).toBe(url)
    })
  })

  describe('uRL creators', () => {
    it('getClubUrl should return the correct URL for a club', () => {
      const clubId = 'some-club-id'
      const expectedUrl = `${getDHBBaseUrl()}/clubs/${clubId}`
      expect(getClubUrl(clubId)).toBe(expectedUrl)
    })
  })
})
