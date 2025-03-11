<template>
  <div>
    <div class="flex px-3 py-3.5 border-b border-gray-200 dark:border-gray-700">
      <UInput v-model="q" placeholder="Filter ..." />
    </div>

    <UTable :rows="filteredRows" :columns="columns" :sort="sort" />
  </div>
</template>

<script lang="ts" setup>
import type { Game, Lineup, Player } from '~~/types'

const props = defineProps({
  teamId: {
    type: String,
    required: true,
  },
})
const { teamId } = props

const sort = ref<{ column: string; direction: 'desc' | 'asc' }>({
  column: 'goals',
  direction: 'desc'
})
const columns = [{ key: 'firstname', label: 'Firstname', sortable: true }, { key: 'lastname', label: 'Lastname', sortable: true },
{ key: 'gamesPlayed', label: 'Games played', sortable: true }, { key: 'goals', label: 'Goals', sortable: true },
{ key: 'penaltyGoals', label: 'Penalty goals', sortable: true }, { key: 'penaltyMissed', label: 'Penalty missed', sortable: true },
{ key: 'yellowCards', label: 'Yellow Cards', sortable: true }, { key: 'penalties', label: 'Penalties', sortable: true },
{ key: 'redCards', label: 'Red Cards', sortable: true }, { key: 'blueCards', label: 'Blue Cards', sortable: true }]

const { data: teamLineup, status: teamLineupState } = await useAsyncData(
  `team/${teamId}/lineup`,
  () => $fetch('/api/dhb/team/lineup', {
    query: { id: teamId },
  }),
)

const q = ref('')

const filteredRows = computed(() => {
  if (!q.value) {
    return teamLineup
  }

  return teamLineup.value?.filter((player) => {
    return Object.values(player).some((value) => {
      return String(value).toLowerCase().includes(q.value.toLowerCase())
    })
  })
})

</script>

<style></style>