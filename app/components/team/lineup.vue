<template>
  <div>
    <UTable :rows="teamLineup" />
  </div>
</template>

<script lang="ts" setup>
import type { Game, Lineup } from '~~/types'

var teamLineup = Array<Lineup>()

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

for (const game of games) {
  console.log(game)
  const { data: lineup, pending: lineupPending } = await useAsyncData(
    `${game.id}/lineup`,
    () => $fetch('/api/dhb/game/lineup', {
      query: { id: game.id },
    })
  )

  if (game.homeTeam.id === teamId) {
    teamLineup.push(lineup.value.data.home)
  } else {
    teamLineup.push(lineup.value.data.away)
  }
  console.log(lineup)

}
</script>

<style></style>