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
  {
    key: 'pdfUrl',
    label: 'PDF',
    shouldShow: shouldShowColumn('pdfUrl'),
    cell: ({ row }) => {
      if (!row.original.pdfUrl)
        return ''
      return h('a', {
        'href': row.original.pdfUrl,
        'target': '_blank',
        'rel': 'noopener noreferrer',
        'class': 'inline-flex items-center justify-center w-8 h-8 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors',
        'aria-label': 'Open PDF',
      }, [
        h(resolveComponent('UIcon'), {
          name: 'i-heroicons-document-text',
          class: 'w-5 h-5',
        }),
      ])
    },
  },
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
  conditionalColumns.forEach(({ key, label, shouldShow, cell }) => {
    if (shouldShow.value) {
      const column = {
        accessorKey: key,
        header: label,
      }

      // Add custom cell renderer if provided
      if (cell) {
        column.cell = cell
      }

      baseColumns.push(column)
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
