<script lang="ts" setup>
import type { TableColumn } from '@nuxt/ui'
import type { Column } from '@tanstack/vue-table'

const route = useRoute()

const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')

const { data: lineup, pending } = await useAsyncData(
  `club-lineup/${route.params.id}`,
  () => $fetch('/api/dhb/club/lineup', {
    query: { id: route.params.id },
  }),
)

// Get club info for the header
const { data: club } = await useAsyncData(
  `club/${route.params.id}`,
  () => $fetch('/api/dhb/club', {
    query: { id: route.params.id },
  }),
)

useSeoMeta({
  title: `${club.value?.name} - Lineup`,
  description: `Player lineup and statistics for ${club.value?.name}`,
})

function shouldShowColumn(fieldName: string) {
  return computed(() => {
    if (!lineup.value || lineup.value.length === 0)
      return false
    return lineup.value.some(player => (player as any)[fieldName] > 0)
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
    {
      accessorKey: 'teams',
      header: ({ column }) => getHeader(column, 'Teams'),
      cell: ({ row }) => h('div', { class: 'flex flex-wrap gap-1' }, row.original.teams.map((team: { id: string, name: string }) =>
        h(resolveComponent('UBadge'), {
          key: team.id,
          label: team.acronym || team.name,
          size: 'sm',
        }),
      )),
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

const sorting = ref([
  {
    id: 'goals',
    desc: true,
  },
])

const q = ref('')

const filteredRows = computed(() => {
  if (!q.value) {
    return lineup.value || []
  }

  return lineup.value?.filter((player) => {
    return Object.values(player).some((value) => {
      return String(value).toLowerCase().includes(q.value.toLowerCase())
    })
  }) || []
})

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
    <UPage>
      <UPageHeader headline="Club Lineup" :title="`${club?.name} - Players`" />
      <UPageBody>
        <UTable v-model:sorting="sorting" :data="filteredRows" :columns="columns" :loading="pending" class="flex-1"
          sticky />
      </UPageBody>
    </UPage>
  </div>
</template>

<style></style>
