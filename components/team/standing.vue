<template>
  <div>
    <UTable :rows="standing" :loading="pending" :columns="columns" />
  </div>
</template>

<script lang="ts" setup>
const route = useRoute()
let standing = ref()

const columns = [{ key: 'rank', label: 'Rank' },
{ key: 'team.name', label: 'Team' },
{ key: 'points', label: 'Points' },
{ key: 'games', label: 'Games' },
{ key: 'wins', label: 'Wins' },
{ key: 'draws', label: 'Draws' },
{ key: 'losses', label: 'Losses' },
{ key: 'goals', label: 'Goals' },
{ key: 'goalsAgainst', label: 'Goals Against' },
{ key: 'goalDifference', label: 'Goal Difference' }]

const { data, pending, error, refresh } = await useAsyncData(
  `team/${route.params.id}/standing`,
  () => $fetch("/api/dhb/team/standing", {
    query: { id: route.params.id }
  })
)
standing = data
</script>

<style></style>