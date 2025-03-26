<script lang="ts" setup>
import type { TableColumn } from '@nuxt/ui'

const props = defineProps({
  teamId: {
    type: String,
    required: true,
  },
})
const { teamId } = props

const columns: TableColumn<any>[] = [{ accessorKey: 'firstname', header: 'Firstname' }, { accessorKey: 'lastname', header: 'Lastname' }, { accessorKey: 'gamesPlayed', header: 'Games played' }, { accessorKey: 'goals', header: 'Goals' }, { accessorKey: 'penaltyGoals', header: 'Penalty goals' }, { accessorKey: 'penaltyMissed', header: 'Penalty missed' }, { accessorKey: 'yellowCards', header: 'Yellow Cards' }, { accessorKey: 'penalties', header: 'Penalties' }, { accessorKey: 'redCards', header: 'Red Cards' }, { accessorKey: 'blueCards', header: 'Blue Cards' }]

const { data: teamLineup, status: teamLineupState } = await useAsyncData(
  `team/${teamId}/lineup`,
  () => $fetch('/api/dhb/team/lineup', {
    query: { id: teamId },
  }),
)

const q = ref('')

const filteredRows = computed(() => {
  if (!q.value) {
    return teamLineup.value || []
  }

  return teamLineup.value?.filter((player) => {
    return Object.values(player).some((value) => {
      return String(value).toLowerCase().includes(q.value.toLowerCase())
    })
  }) || []
})
</script>

<template>
  <div>
    <div class="flex px-3 py-3.5 border-b border-gray-200 dark:border-gray-700">
      <UInput v-model="q" placeholder="Filter ..." />
    </div>

    <UTable :data="filteredRows" :columns="columns" :loading="teamLineupState === 'pending'" class="flex-1" />
  </div>
</template>

<style></style>
