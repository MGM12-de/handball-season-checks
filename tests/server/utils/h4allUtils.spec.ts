import { describe, expect, it } from 'vitest'
import {
  extractGames,
  extractScores,
  getH4AllLeagueUrl,
  getReportBaseUrl,
  mapH4AllGame,
  mapH4AllStandingsRow,
  parseH4AllDate,
  parseH4AllLeagueId,
} from '../../../server/utils/h4allUtils'

describe('h4allUtils', () => {
  describe('parseH4AllLeagueId', () => {
    it('splits "<og>:<classId>" into its parts', () => {
      expect(parseH4AllLeagueId('3:87355')).toEqual({ og: '3', classId: '87355' })
    })

    it('throws on a malformed id', () => {
      expect(() => parseH4AllLeagueId('87355')).toThrow()
      expect(() => parseH4AllLeagueId('')).toThrow()
    })
  })

  describe('getH4AllLeagueUrl', () => {
    it('builds the "ps" (Punktspiele) query for a league', () => {
      const url = getH4AllLeagueUrl('3', '87355')
      expect(url).toContain('ca=1&og=3&cmd=ps&cl=87355')
    })
  })

  describe('parseH4AllDate', () => {
    it('formats a 2-digit-year date and time like the DHB adapter does', () => {
      expect(parseH4AllDate('05.10.25', '15:30')).toBe('5.10.2025, 15:30')
    })

    it('falls back to just the date when no time is given', () => {
      expect(parseH4AllDate('05.10.25')).toBe('5.10.2025')
    })

    it('returns undefined for missing or unparsable input', () => {
      expect(parseH4AllDate(undefined)).toBeUndefined()
      expect(parseH4AllDate('not-a-date')).toBeUndefined()
    })
  })

  describe('extractGames / extractScores / getReportBaseUrl', () => {
    it('reads games and score from the content-wrapped shape', () => {
      const raw = {
        head: { repURL: 'https://spo.handball4all.de/service/sboReport.php?sGID=' },
        content: {
          futureGames: { gClassID: '87355', games: [{ gID: '1' }] },
          score: [{ tabTeamID: '10' }],
        },
      }

      expect(extractGames(raw)).toEqual([{ gID: '1' }])
      expect(extractScores(raw)).toEqual([{ tabTeamID: '10' }])
      expect(getReportBaseUrl(raw)).toBe('https://spo.handball4all.de/service/sboReport.php?sGID=')
    })

    it('reads games from the flat shape when there is no content wrapper', () => {
      const raw = { gClassID: '87355', games: [{ gID: '2' }] }

      expect(extractGames(raw)).toEqual([{ gID: '2' }])
      expect(extractScores(raw)).toEqual([])
    })

    it('returns an empty array when neither shape has games/score', () => {
      expect(extractGames({})).toEqual([])
      expect(extractScores({})).toEqual([])
    })
  })

  describe('mapH4AllGame', () => {
    it('maps a played game to the app-facing shape', () => {
      const raw = {
        gID: '12345',
        gDate: '05.10.25',
        gTime: '15:30',
        gHomeTeam: 'TSV Willsbach',
        gGuestTeam: 'TV Flein 2',
        gHomeGoals: '28',
        gGuestGoals: '24',
        gGymnasiumName: 'Schozachtalhalle',
        gGymnasiumID: '42',
        gReferee: 'Max Mustermann',
        sGID: '99',
      }

      expect(mapH4AllGame(raw, 'https://spo.handball4all.de/service/sboReport.php?sGID=')).toMatchObject({
        id: '12345',
        startsAt: '5.10.2025, 15:30',
        homeTeam: { id: 'TSV Willsbach', name: 'TSV Willsbach' },
        awayTeam: { id: 'TV Flein 2', name: 'TV Flein 2' },
        result: '28:24',
        homeGoals: 28,
        awayGoals: 24,
        goalDifference: 4,
        field: { id: '42', name: 'Schozachtalhalle' },
        referee: 'Max Mustermann',
        pdfUrl: 'https://spo.handball4all.de/service/sboReport.php?sGID=99',
      })
    })

    it('leaves the result undefined for a not-yet-played game', () => {
      const raw = {
        gID: '12346',
        gDate: '12.10.25',
        gTime: '11:00',
        gHomeTeam: 'TSV Willsbach',
        gGuestTeam: 'TV Flein 2',
        gHomeGoals: '',
        gGuestGoals: '',
      }

      const game = mapH4AllGame(raw)
      expect(game.result).toBeUndefined()
      expect(game.homeGoals).toBeUndefined()
      expect(game.awayGoals).toBeUndefined()
      expect(game.pdfUrl).toBeUndefined()
    })
  })

  describe('mapH4AllStandingsRow', () => {
    it('maps a raw score row to the app-facing table row shape', () => {
      const raw = {
        tabTeamID: '10',
        tabScore: '1',
        tabTeamname: 'TSV Willsbach',
        numPlayedGames: '10',
        numWonGames: '8',
        numEqualGames: '1',
        numLostGames: '1',
        numGoalsShot: '300',
        numGoalsGot: '250',
        pointsPlus: '17',
        pointsMinus: '3',
      }

      expect(mapH4AllStandingsRow(raw)).toEqual({
        rank: 1,
        games: 10,
        wins: 8,
        draws: 1,
        losses: 1,
        goals: 300,
        goalsAgainst: 250,
        goalDifference: 50,
        points: '17:3',
        team: { id: '10', name: 'TSV Willsbach' },
      })
    })
  })
})
