import { describe, expect, it } from 'vitest'
import { currentRoundOnly, getClubSearchUrl, getClubUrl, getDHBBaseUrl, mapStandingsRow, normalizeImageUrl } from '../../../server/utils/dhbUtils'

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
      const clubId = 6762
      const expectedUrl = `${getDHBBaseUrl()}/teams/clubs/${clubId}`
      expect(getClubUrl(clubId)).toBe(expectedUrl)
    })

    it('getClubSearchUrl should return the clubs collection URL', () => {
      expect(getClubSearchUrl()).toBe(`${getDHBBaseUrl()}/teams/clubs`)
    })
  })

  describe('currentRoundOnly', () => {
    it('keeps only rows from the highest round', () => {
      const rows = [
        { team: { id: 1 }, round: 1 },
        { team: { id: 1 }, round: 2 },
        { team: { id: 2 }, round: 2 },
      ]

      expect(currentRoundOnly(rows)).toEqual([
        { team: { id: 1 }, round: 2 },
        { team: { id: 2 }, round: 2 },
      ])
    })

    it('returns an empty array unchanged', () => {
      expect(currentRoundOnly([])).toEqual([])
    })
  })

  describe('mapStandingsRow', () => {
    it('maps raw standings fields to the app-facing shape', () => {
      const row = {
        position: 1,
        played: 10,
        won: 8,
        drawn: 1,
        lost: 1,
        goals_for: 300,
        goals_against: 250,
        goals_diff: 50,
        points: 17,
        team: { id: 84219, name: 'TV 1895 FLEIN II', club: { logo: '/logo.png' } },
      }

      expect(mapStandingsRow(row)).toMatchObject({
        rank: 1,
        games: 10,
        wins: 8,
        draws: 1,
        losses: 1,
        goals: 300,
        goalsAgainst: 250,
        goalDifference: 50,
        team: { id: 84219, name: 'TV 1895 FLEIN II', logo: 'https://handball.net/logo.png' },
      })
    })
  })
})
