<script lang="ts" setup>
import type { TableColumn } from '@nuxt/ui'

const props = defineProps({
  teamId: {
    type: String,
    required: true,
  },
})
const standing = ref()
const { teamId } = props

const columns: TableColumn<any>[] = [{ accessorKey: 'rank', header: 'Rank' }, { accessorKey: 'team.name', header: 'Team' }, { accessorKey: 'points', header: 'Points' }, { accessorKey: 'games', header: 'Games' }, { accessorKey: 'wins', header: 'Wins' }, { accessorKey: 'draws', header: 'Draws' }, { accessorKey: 'losses', header: 'Losses' }, { accessorKey: 'goals', header: 'Goals' }, { accessorKey: 'goalsAgainst', header: 'Goals Against' }, { accessorKey: 'goalDifference', header: 'Goal Difference' }]

const { data, status } = await useAsyncData(
  `team/${teamId}/standing`,
  () => $fetch('/api/dhb/team/standing', {
    query: { id: teamId },
  }),
)
standing.value = data.value
</script>

<template>
  <div>
    <UTable :data="standing" :loading="status === 'pending'" :columns="columns" />
  </div>
</template>

<style></style>
