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

// Helper function to check if a column should be shown
function shouldShowColumn(fieldName: string) {
  return computed(() => {
    if (!games || games.length === 0)
      return false
    return games.some((game) => {
      const value = fieldName.includes('.')
        ? fieldName.split('.').reduce((obj, key) => obj?.[key], game)
        : game[fieldName]
      return value && String(value).trim() !== ''
    })
  })
}

// Define conditional columns with their visibility logic
const conditionalColumns = [
  { key: 'remarks', label: 'Remarks', shouldShow: shouldShowColumn('remarks') },
]

const columns = computed<TableColumn<any>[]>(() => {
  const baseColumns: TableColumn<any>[] = [
    { accessorKey: 'startsAt', header: 'Date' },
    { accessorKey: 'field.name', header: 'Location' },
    { accessorKey: 'homeTeam.name', header: 'Home Team' },
    { accessorKey: 'awayTeam.name', header: 'Away Team' },
    { accessorKey: 'result', header: 'Result' },
  ]

  // Add conditional columns
  conditionalColumns.forEach(({ key, label, shouldShow }) => {
    if (shouldShow.value) {
      baseColumns.push({
        accessorKey: key,
        header: label,
      })
    }
  })

  return baseColumns
})
</script>

<template>
  <div>
    <UTable :data="games" :loading="gamesPending" :columns="columns" />
  </div>
</template>

<style></style>
