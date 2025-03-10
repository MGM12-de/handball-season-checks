<template>
  <UPage>
    <UPageHeader :headline="tournament.acronym" :title="tournament.name" description="" />
    <UPageBody>
      <UTable :rows="tournamentTable" :columns="columns" />
    </UPageBody>
  </UPage>
</template>

<script lang="ts" setup>
const route = useRoute()

useSeoMeta({
  title: `Tournament`,
  description: '',
})

const { data: tournament, status: tournamentStatus } = await useAsyncData(
  `tournament/${route.params.id}`,
  () => $fetch('/api/dhb/tournament', {
    query: { id: route.params.id },
  }),
)

const columns = [{ key: 'rank', label: 'Rank' }, { key: 'team.name', label: 'Team' }, { key: 'points', label: 'Points' }, { key: 'games', label: 'Games' }, { key: 'wins', label: 'Wins' }, { key: 'draws', label: 'Draws' }, { key: 'losses', label: 'Losses' }, { key: 'goals', label: 'Goals' }, { key: 'goalsAgainst', label: 'Goals Against' }, { key: 'goalDifference', label: 'Goal Difference' }]


const { data: tournamentTable, status: tournamentTableStatus } = await useAsyncData(
  `tournament/${route.params.id}/table`,
  () => $fetch('/api/dhb/tournament/table', {
    query: { id: route.params.id },
  }),
)

</script>

<style></style>