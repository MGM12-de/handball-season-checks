<template>
  <div>
    <UTable :rows="teamLineup" :columns="columns" :sort="sort" />
  </div>
</template>

<script lang="ts" setup>
import type { Game, Lineup, Player } from '~~/types'

const props = defineProps({
  teamId: {
    type: String,
    required: true,
  },
  games: {
    type: Array as () => Game[],
    required: true,
  },
  gamesPending: {
    type: Boolean,
    required: true,
  },
})
const { teamId, games } = props

const sort = ref<{ column: string; direction: 'desc' | 'asc' }>({
  column: 'goals',
  direction: 'desc'
})
const columns = [{ key: 'firstname', label: 'Firstname', sortable: true }, { key: 'lastname', label: 'Lastname', sortable: true }, { key: 'goals', label: 'Goals', sortable: true }, { key: 'penaltyGoals', label: 'Penalty goals', sortable: true }, { key: 'penaltyMissed', label: 'Penalty missed', sortable: true }, { key: 'yellowCards', label: 'Yellow Cards', sortable: true }, { key: 'penalties', label: 'Penalties', sortable: true }, { key: 'redCards', label: 'Red Cards', sortable: true }, { key: 'blueCards', label: 'Blue Cards', sortable: true }]

var teamLineup = Array<Lineup>()

for (const game of games) {
  const { data: lineup, pending: lineupPending } = await useAsyncData(
    `${game.id}/lineup`,
    () => $fetch('/api/dhb/game/lineup', {
      query: { id: game.id },
    })
  )

  if (game.homeTeam.id === teamId) {
    lineup.value.home.forEach(homePlayer => {
      addPlayer2Lineup(homePlayer)
    });
  } else {
    lineup.value.away.forEach(awayPlayer => {
      addPlayer2Lineup(awayPlayer)
    });
  }
}
function addPlayer2Lineup(player: Player) {

  const existingPlayerIndex = teamLineup.findIndex(
    (p) => p.firstname === player.firstname && p.lastname === player.lastname
  )
  if (existingPlayerIndex !== -1) {
    teamLineup[existingPlayerIndex].goals += player.goals
    teamLineup[existingPlayerIndex].penaltyGoals += player.penaltyGoals
    teamLineup[existingPlayerIndex].penaltyMissed += player.penaltyMissed
    teamLineup[existingPlayerIndex].penalties += player.penalties
    teamLineup[existingPlayerIndex].yellowCards += player.yellowCards
    teamLineup[existingPlayerIndex].redCards += player.redCards
    teamLineup[existingPlayerIndex].blueCards += player.blueCards
  }
  else {
    teamLineup.push(player)
  }
}

</script>

<style></style>