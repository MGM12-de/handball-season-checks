<script lang="ts" setup>
import type { TableColumn } from '@nuxt/ui'

const props = defineProps({
  games: {
    type: Array,
    required: true,
  },
  gamesPending: {
    type: Boolean,
    required: true,
  },
})
const { games, gamesPending } = props

const columns: TableColumn<any>[] = [{ accessorKey: 'startsAt', header: 'Date' }, { accessorKey: 'field.name', header: 'Location' }, { accessorKey: 'homeTeam.name', header: 'Home Team' }, { accessorKey: 'awayTeam.name', header: 'Away Team' }, { accessorKey: 'result', header: 'Result' }, { accessorKey: 'remarks', header: 'Remarks' }]
</script>

<template>
  <div>
    <UTable :data="games" :loading="gamesPending" :columns="columns" />
  </div>
</template>

<style></style>
