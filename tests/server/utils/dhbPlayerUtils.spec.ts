import type { Lineup, Player } from '../../../types'
import { describe, expect, it } from 'vitest'
import { getPlayerKey, mergePlayerStats } from '../../../server/utils/dhbPlayerUtils'

describe('dhbPlayerUtils', () => {
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
