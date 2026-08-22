import type { Lineup, Player } from '../../../types'
import { describe, expect, it } from 'vitest'
import { getPlayerKey, mapPlayerStatsEntry, mergePlayerStats } from '../../../server/utils/dhbPlayerUtils'

describe('dhbPlayerUtils', () => {
  describe('mapPlayerStatsEntry', () => {
    it('maps a raw /stats/player-stats entry to the app Player shape', () => {
      const entry = {
        player: { id: 2241609, first_name: 'Julia', last_name: 'Bilmann' },
        dorsal: '7',
        stats: {
          goals: 42,
          matches_played: 10,
          warnings: 2,
          suspensions: 3,
          disqualifications: 1,
          blue_cards: 0,
          seven_meters: 5,
        },
      }

      expect(mapPlayerStatsEntry(entry)).toEqual({
        id: 2241609,
        firstname: 'Julia',
        lastname: 'Bilmann',
        position: '',
        number: 7,
        goals: 42,
        penaltyGoals: 5,
        penaltyMissed: 0,
        penalties: 3,
        yellowCards: 2,
        redCards: 1,
        blueCards: 0,
        type: '',
        gamesPlayed: 10,
      })
    })

    it('defaults missing dorsal and stats to safe values', () => {
      const entry = { player: { id: 1, first_name: 'A', last_name: 'B' } }

      expect(mapPlayerStatsEntry(entry)).toMatchObject({
        number: 0,
        goals: 0,
        gamesPlayed: 0,
      })
    })
  })

  describe('getPlayerKey', () => {
    it('should create a consistent key from player names', () => {
      const player: Player = { firstname: 'John', lastname: 'Doe', goals: 0, id: '' }
      expect(getPlayerKey(player)).toBe('john_doe')
    })

    it('should handle missing names gracefully', () => {
      const player: Player = { firstname: undefined, lastname: 'Doe', goals: 0, id: '' }
      expect(getPlayerKey(player)).toBe('undefined_doe')
    })
  })

  describe('mergePlayerStats', () => {
    it('should add a new player to the map', () => {
      const playerMap = new Map<string, Lineup>()
      const player: Player = { id: '1', firstname: 'John', lastname: 'Doe', goals: 5, penaltyGoals: 2, gamesPlayed: 1 }

      mergePlayerStats(playerMap, player)

      expect(playerMap.has('john_doe')).toBe(true)
      const storedPlayer = playerMap.get('john_doe')
      expect(storedPlayer?.goals).toBe(5)
    })

    it('should merge stats for an existing player', () => {
      const playerMap = new Map<string, Lineup>()
      const player1: Player = { id: '1', firstname: 'John', lastname: 'Doe', goals: 5, penaltyGoals: 1, gamesPlayed: 1 }
      const player2: Player = { id: '2', firstname: 'John', lastname: 'Doe', goals: 10, penaltyGoals: 3, gamesPlayed: 1 }

      mergePlayerStats(playerMap, player1)
      mergePlayerStats(playerMap, player2)

      const storedPlayer = playerMap.get('john_doe')
      expect(storedPlayer?.goals).toBe(15)
      expect(storedPlayer?.penaltyGoals).toBe(4)
      expect(storedPlayer?.gamesPlayed).toBe(2)
    })
  })
})
