<script lang="ts" setup>
import type { TableColumn } from '@nuxt/ui'
import type { Column } from '@tanstack/vue-table'

const props = defineProps({
  teamId: {
    type: String,
    required: true,
  },
})

const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')

const { teamId } = props

const { data: teamLineup, status: teamLineupState } = await useAsyncData(
  `team/${teamId}/lineup`,
  () => $fetch('/api/dhb/team/lineup', {
    query: { id: teamId },
  }),
)

// Helper function to check if a column should be shown
function shouldShowColumn(fieldName: string) {
  return computed(() => {
    if (!teamLineup.value || teamLineup.value.length === 0)
      return false
    return teamLineup.value.some(player => player[fieldName] > 0)
  })
}

// Define conditional columns with their visibility logic
const conditionalColumns = [
  { key: 'yellowCards', label: 'Yellow Cards', shouldShow: shouldShowColumn('yellowCards') },
  { key: 'penalties', label: 'Penalties', shouldShow: shouldShowColumn('penalties') },
  { key: 'redCards', label: 'Red Cards', shouldShow: shouldShowColumn('redCards') },
  { key: 'blueCards', label: 'Blue Cards', shouldShow: shouldShowColumn('blueCards') },
]

const columns = computed<TableColumn<any>[]>(() => {
  const baseColumns: TableColumn<any>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => getHeader(column, 'Name'),
      cell: ({ row }) => `${row.original.firstname} ${row.original.lastname}`,
    },
    { accessorKey: 'gamesPlayed', header: ({ column }) => getHeader(column, 'Games played') },
    { accessorKey: 'goals', header: ({ column }) => getHeader(column, 'Goals') },
  ]

  // Add conditional columns
  conditionalColumns.forEach(({ key, label, shouldShow }) => {
    if (shouldShow.value) {
      baseColumns.push({
        accessorKey: key,
        header: ({ column }) => getHeader(column, label),
      })
    }
  })

  return baseColumns
})

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

const sorting = ref([
  {
    id: 'goals',
    desc: true,
  },
])

function getHeader(column: Column<any>, label: string) {
  const isSorted = column.getIsSorted()

  return h(
    UDropdownMenu,
    {
      'content': {
        align: 'start',
      },
      'aria-label': 'Actions dropdown',
      'items': [
        {
          label: 'Asc',
          type: 'checkbox',
          icon: 'i-lucide-arrow-up-narrow-wide',
          checked: isSorted === 'asc',
          onSelect: () => {
            if (isSorted === 'asc') {
              column.clearSorting()
            }
            else {
              column.toggleSorting(false)
            }
          },
        },
        {
          label: 'Desc',
          icon: 'i-lucide-arrow-down-wide-narrow',
          type: 'checkbox',
          checked: isSorted === 'desc',
          onSelect: () => {
            if (isSorted === 'desc') {
              column.clearSorting()
            }
            else {
              column.toggleSorting(true)
            }
          },
        },
      ],
    },
    () =>
      h(UButton, {
        'color': 'neutral',
        'variant': 'ghost',
        label,
        'icon': isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        'class': '-mx-2.5 data-[state=open]:bg-(--ui-bg-elevated)',
        'aria-label': `Sort by ${isSorted === 'asc' ? 'descending' : 'ascending'}`,
      }),
  )
}
</script>

<template>
  <div>
    <div class="flex px-3 py-3.5 border-b border-gray-200 dark:border-gray-700">
      <UInput v-model="q" placeholder="Filter ..." />
    </div>

    <UTable v-model:sorting="sorting" :data="filteredRows" :columns="columns" :loading="teamLineupState === 'pending'"
      class="flex-1" sticky />
  </div>
</template>

<style></style>
