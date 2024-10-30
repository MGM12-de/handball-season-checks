<script lang="ts" setup>
const props = defineProps({
  teamId: {
    type: String,
    required: true,
  },
})
const standing = ref()
const { teamId } = props

const columns = [{ key: 'rank', label: 'Rank' }, { key: 'team.name', label: 'Team' }, { key: 'points', label: 'Points' }, { key: 'games', label: 'Games' }, { key: 'wins', label: 'Wins' }, { key: 'draws', label: 'Draws' }, { key: 'losses', label: 'Losses' }, { key: 'goals', label: 'Goals' }, { key: 'goalsAgainst', label: 'Goals Against' }, { key: 'goalDifference', label: 'Goal Difference' }]

const { data, pending, error, refresh } = await useAsyncData(
  `team/${teamId}/standing`,
  () => $fetch('/api/dhb/team/standing', {
    query: { id: teamId },
  }),
)
standing.value = data
</script>

<template>
  <div>
    <UTable :rows="standing" :loading="pending" :columns="columns" />
  </div>
</template>

<style></style>
