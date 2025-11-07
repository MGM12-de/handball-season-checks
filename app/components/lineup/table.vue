<script lang="ts" setup>
import type { TableColumn } from '@nuxt/ui'
import type { Column } from '@tanstack/vue-table'

interface Player {
  id: string
  firstname: string
  lastname: string
  gamesPlayed?: number
  goals?: number
  yellowCards?: number
  penalties?: number
  redCards?: number
  blueCards?: number
  teams?: Array<{ id: string, name: string, acronym: string }>
  club?: { id: string, name: string, acronym: string }
  [key: string]: any
}

interface Props {
  data: Player[]
  loading?: boolean
  showTeams?: boolean
  showClub?: boolean
  showSearch?: boolean
  initialSorting?: Array<{ id: string, desc: boolean }>
  additionalColumns?: Array<{ key: string, label: string, shouldShow?: () => boolean }>
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  showTeams: false,
  showClub: false,
  showSearch: true,
  initialSorting: () => [{ id: 'goals', desc: true }],
})

const { t } = useI18n()
const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UBadge = resolveComponent('UBadge')

// Helper function to check if a column should be shown
function shouldShowColumn(fieldName: string) {
  return computed(() => {
    if (!props.data || props.data.length === 0)
      return false
    return props.data.some((player) => {
      const value = player[fieldName]
      return value != null && value > 0
    })
  })
}

// Define conditional columns
const conditionalColumns = computed(() => [
  { key: 'yellowCards', label: t('yellowCards'), shouldShow: shouldShowColumn('yellowCards') },
  { key: 'penalties', label: t('penalties'), shouldShow: shouldShowColumn('penalties') },
  { key: 'redCards', label: t('redCards'), shouldShow: shouldShowColumn('redCards') },
  { key: 'blueCards', label: t('blueCards'), shouldShow: shouldShowColumn('blueCards') },
  ...(props.additionalColumns || []),
])

const columns = computed<TableColumn<any>[]>(() => {
  const baseColumns: TableColumn<any>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => getHeader(column, t('name')),
      cell: ({ row }) => `${row.original.firstname} ${row.original.lastname}`,
      footer: ({ column }) => {
        const rowCount = column.getFacetedRowModel().rows.length
        return h('div', { class: 'text-center font-medium' }, `${rowCount} ${t('players')}`)
      },
    },
  ]

  // Add teams column if requested
  if (props.showTeams) {
    baseColumns.push({
      accessorKey: 'teams',
      header: ({ column }) => getHeader(column, t('club')),
      cell: ({ row }) => {
        if (!row.original.teams)
          return ''
        return h('div', { class: 'flex flex-wrap gap-1' }, row.original.teams.map((team: any) =>
          h(UBadge, {
            key: team.id,
            label: team.acronym || team.name,
            size: 'sm',
          }),
        ))
      },
    })
  }

  if (props.showClub) {
    baseColumns.push({
      accessorKey: 'club',
      header: ({ column }) => getHeader(column, t('club')),
      cell: ({ row }) => {
        if (!row.original.team)
          return ''
        return h('div', { class: 'flex flex-wrap gap-1' }, h(UBadge, {
          key: row.original.team.id,
          label: row.original.team.name,
          size: 'sm',
          variant: 'outline',
          avatar: {
            src: row.original.team.logo || '',
            alt: row.original.team.name,
          },
        }))
      },
    })
  }

  // Add standard columns
  baseColumns.push(
    { accessorKey: 'gamesPlayed', header: ({ column }) => getHeader(column, t('gamesPlayed')) },
    {
      accessorKey: 'goals',
      header: ({ column }) => getHeader(column, t('goals')),
      footer: ({ column }) => {
        const total = column
          .getFacetedRowModel()
          .rows
          .reduce((acc: number, row: any) => acc + Number.parseFloat(row.getValue('goals') || 0), 0)
        return h('div', { class: 'text-center font-medium' }, `${total}`)
      },
    },
  )

  // Add conditional columns
  conditionalColumns.value.forEach(({ key, label, shouldShow }) => {
    if (!shouldShow || shouldShow.value) {
      baseColumns.push({
        accessorKey: key,
        header: ({ column }) => getHeader(column, label),
        footer: ({ column }) => {
          const total = column
            .getFacetedRowModel()
            .rows
            .reduce((acc: number, row: any) => acc + Number.parseFloat(row.getValue(key) || 0), 0)
          return h('div', { class: 'text-center font-medium' }, `${total}`)
        },
      })
    }
  })

  return baseColumns
})

// Search functionality
const q = ref('')
const filteredRows = computed(() => {
  if (!q.value)
    return props.data

  return props.data.filter((player) => {
    return Object.values(player).some((value) => {
      return String(value).toLowerCase().includes(q.value.toLowerCase())
    })
  })
})

const sorting = ref(props.initialSorting)

function getHeader(column: Column<any>, label: string) {
  const isSorted = column.getIsSorted()

  return h(
    UDropdownMenu,
    {
      'content': { align: 'start' },
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
    <div v-if="showSearch" class="flex px-3 py-3.5 border-b border-gray-200 dark:border-gray-700">
      <UInput v-model="q" placeholder="Filter ..." />
    </div>

    <UTable v-model:sorting="sorting" :data="filteredRows" :columns="columns" :loading="loading"
      class="flex-1 max-h-[624px]" sticky />
  </div>
</template>
