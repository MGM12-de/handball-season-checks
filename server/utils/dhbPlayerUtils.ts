import type { Lineup, Player } from '~~/types'

/**
 * Map a raw entry from `/stats/player-stats?team_id=` to this app's Player shape.
 *
 * The new API breaks sanctions down by type (`warnings`, `suspensions`,
 * `disqualifications`, `blue_cards`) instead of one combined `sanctions`
 * counter, which maps cleanly onto the existing yellow/2min/red/blue fields.
 * `seven_meters` (makes) is the closest match for `penaltyGoals`; there is no
 * separate "missed" counter in the new API.
 */
export function mapPlayerStatsEntry(entry: any): Player {
  const stats = entry.stats ?? {}

  return {
    id: entry.player.id,
    firstname: entry.player.first_name,
    lastname: entry.player.last_name,
    photoUrl: entry.player.photo_url ?? undefined,
    position: '',
    number: entry.dorsal ? Number(entry.dorsal) : 0,
    goals: stats.goals ?? 0,
    penaltyGoals: stats.seven_meters ?? 0,
    penaltyMissed: 0,
    penalties: stats.suspensions ?? 0,
    yellowCards: stats.warnings ?? 0,
    redCards: stats.disqualifications ?? 0,
    blueCards: stats.blue_cards ?? 0,
    type: '',
    gamesPlayed: stats.matches_played ?? 0,
  }
}

/**
 * Creates a unique key for a player based on normalized first and last name.
 * @param player - The player object.
 * @returns A unique string key.
 */
export function getPlayerKey(player: Player): string {
  return `${player.firstname?.toLowerCase()}_${player.lastname?.toLowerCase()}`
}

/**
 * Merges player stats into an existing map of players or adds a new player.
 * @param playerMap - The map where player stats are stored/aggregated.
 * @param player - The new player data object to merge.
 */
export function mergePlayerStats(playerMap: Map<string, Lineup>, player: Player): void {
  const playerKey = getPlayerKey(player)
  const existingPlayer = playerMap.get(playerKey) as Player & { gamesPlayed: number } | undefined

  if (existingPlayer) {
    existingPlayer.gamesPlayed += player.gamesPlayed || 1
    existingPlayer.goals += player.goals || 0
    existingPlayer.penaltyGoals += player.penaltyGoals || 0
    existingPlayer.penaltyMissed += player.penaltyMissed || 0
    existingPlayer.penalties += player.penalties || 0
    existingPlayer.yellowCards += player.yellowCards || 0
    existingPlayer.redCards += player.redCards || 0
    existingPlayer.blueCards += player.blueCards || 0
  }
  else {
    playerMap.set(playerKey, {
      ...player,
      gamesPlayed: player.gamesPlayed || 1,
      goals: player.goals || 0,
      penaltyGoals: player.penaltyGoals || 0,
      penaltyMissed: player.penaltyMissed || 0,
      penalties: player.penalties || 0,
      yellowCards: player.yellowCards || 0,
      redCards: player.redCards || 0,
      blueCards: player.blueCards || 0,
    } as Lineup)
  }
}
