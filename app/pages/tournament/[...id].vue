<template>
  <UPage>
    <UPageHeader :headline="tournament.acronym" :title="tournament.name" description="" />
    <UPageBody>
      <UTabs :items="items" class="w-full">
        <template #standing>
          <UTable :rows="tournamentTable" :columns="columns" />
        </template>
        <template #stats>
          <div>Stats</div>
        </template>
        <template #lineup>
          <UTable :rows="tournamentLineup" :columns="lineupCols" :sort="sortLineup" />
        </template>
      </UTabs>
    </UPageBody>
  </UPage>
</template>

<script lang="ts" setup>
const route = useRoute()

useSeoMeta({
  title: `Tournament`,
  description: '',
})

const items = [{
  slot: 'standing',
  label: 'Standing',
  icon: 'i-mdi-trophy',
}, {
  slot: 'stats',
  label: 'Statistics',
  icon: 'i-mdi-chart-bar',
}, {
  slot: 'lineup',
  label: 'Lineup',
  icon: 'i-mdi-account-group',
}]

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

const lineupCols = [{ key: 'firstname', label: 'Firstname', sortable: true }, { key: 'lastname', label: 'Lastname', sortable: true },
{ key: 'team.name', label: 'Team', sortable: true },
{ key: 'gamesPlayed', label: 'Games played', sortable: true }, { key: 'goals', label: 'Goals', sortable: true },
// { key: 'penaltyGoals', label: 'Penalty goals', sortable: true }, { key: 'penaltyMissed', label: 'Penalty missed', sortable: true },
{ key: 'yellowCards', label: 'Yellow Cards', sortable: true }, { key: 'penalties', label: 'Penalties', sortable: true },
{ key: 'redCards', label: 'Red Cards', sortable: true }, { key: 'blueCards', label: 'Blue Cards', sortable: true }]

const sortLineup = ref<{ column: string; direction: 'desc' | 'asc' }>({
  column: 'goals',
  direction: 'desc'
})

const { data: tournamentLineup, status: tournamentLineupStatus } = await useAsyncData(
  `tournament/${route.params.id}/lineup`,
  () => $fetch('/api/dhb/tournament/lineup', {
    query: { id: route.params.id },
  }),
)

</script>

<style></style>