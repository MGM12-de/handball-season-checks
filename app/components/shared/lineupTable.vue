<script lang="ts" setup>
import type { TableColumn } from '@nuxt/ui'
import type { Column } from '@tanstack/vue-table'

interface Player {
  id: string
  firstname: string
  lastname: string
  photoUrl?: string
  gamesPlayed?: number
  goals?: number
  goalsPerGame?: number
  yellowCards?: number
  penalties?: number
  redCards?: number
  blueCards?: number
  teams?: Array<{ id: string, name: string, acronym?: string }>
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
  enableMultiSort?: boolean
  additionalColumns?: Array<{ key: string, label: string, shouldShow?: () => boolean }>
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  showTeams: false,
  showClub: false,
  showSearch: true,
  enableMultiSort: true,
  initialSorting: () => [{ id: 'goals', desc: true }, { id: 'goalsPerGame', desc: true }],
})

const { t } = useI18n()
const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UBadge = resolveComponent('UBadge')
const UAvatar = resolveComponent('UAvatar')

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
      cell: ({ row }) => {
        const name = `${row.original.firstname} ${row.original.lastname}`
        return h('div', { class: 'flex items-center gap-2' }, [
          h(UAvatar, { src: row.original.photoUrl, alt: name, size: 'xs' }),
          h('span', name),
        ])
      },
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
      header: ({ column }) => getHeader(column, t('teams')),
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
    {
      accessorKey: 'goalsPerGame',
      header: ({ column }) => getHeader(column, t('goalsPerGame')),
      cell: ({ row }) => {
        const goals = Number.parseFloat(row.getValue('goals'))
        const gamesPlayed = Number.parseFloat(row.getValue('gamesPlayed'))
        let goalsPerGame: string = '0'

        if (goals && gamesPlayed)
          goalsPerGame = (goals / gamesPlayed).toFixed(2)

        return h('div', { class: 'text-center font-medium' }, goalsPerGame)
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
          label: t('ascending'),
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
          label: t('descending'),
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
    <div v-if="showSearch" class="flex px-3 py-3.5 border-b border-default">
      <UInput v-model="q" :placeholder="t('filter')" icon="i-lucide-search" class="w-full" />
    </div>

    <!-- Mobile View (Cards) -->
    <div class="block md:hidden space-y-4 p-3">
      <div v-if="loading" class="space-y-4">
        <USkeleton v-for="i in 5" :key="i" class="h-32 w-full" />
      </div>
      <UCard v-for="player in filteredRows" v-else :key="player.id" class="p-4">
        <div class="flex flex-col gap-2">
          <div class="border-b border-default pb-2 mb-1 flex justify-between items-center gap-2">
            <div class="flex items-center gap-2 min-w-0">
              <UAvatar :src="player.photoUrl" :alt="`${player.firstname} ${player.lastname}`" size="md" />
              <span class="font-bold text-lg truncate">{{ player.firstname }} {{ player.lastname }}</span>
            </div>
            <div v-if="showTeams && player.teams" class="flex gap-1 flex-wrap justify-end">
              <UBadge v-for="team in player.teams" :key="team.id" :label="team.acronym || team.name" size="sm" />
            </div>
            <div v-if="showClub && player.team" class="flex justify-end shrink-0">
              <UBadge :label="player.team.name" size="sm" variant="outline" :avatar="{ src: player.team.logo || '', alt: player.team.name }" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-y-2 text-sm">
            <div class="flex items-center gap-1 text-muted">
              <UIcon name="i-mdi-whistle" class="w-4 h-4" />
              <span>{{ t('gamesPlayed') }}:</span>
              <strong class="text-highlighted ml-auto">{{ player.gamesPlayed || 0 }}</strong>
            </div>

            <div class="flex items-center gap-1 text-muted">
              <UIcon name="i-mdi-soccer" class="w-4 h-4" />
              <span>{{ t('goals') }}:</span>
              <strong class="text-highlighted ml-auto">{{ player.goals || 0 }}</strong>
            </div>

            <div class="flex items-center gap-1 text-muted">
              <UIcon name="i-mdi-chart-line" class="w-4 h-4" />
              <span>Ø:</span>
              <strong class="text-highlighted ml-auto">{{ player.gamesPlayed && player.goals ? (player.goals / player.gamesPlayed).toFixed(2) : '0.00' }}</strong>
            </div>

            <div v-if="player.yellowCards" class="flex items-center gap-1 text-muted">
              <div class="w-3 h-4 bg-yellow-400 rounded-sm" />
              <span>{{ t('yellowCards') }}:</span>
              <strong class="text-highlighted ml-auto">{{ player.yellowCards }}</strong>
            </div>

            <div v-if="player.redCards" class="flex items-center gap-1 text-muted">
              <div class="w-3 h-4 bg-red-500 rounded-sm" />
              <span>{{ t('redCards') }}:</span>
              <strong class="text-highlighted ml-auto">{{ player.redCards }}</strong>
            </div>

            <div v-if="player.blueCards" class="flex items-center gap-1 text-muted">
              <div class="w-3 h-4 bg-blue-500 rounded-sm" />
              <span>{{ t('blueCards') }}:</span>
              <strong class="text-highlighted ml-auto">{{ player.blueCards }}</strong>
            </div>

            <div v-if="player.penalties" class="flex items-center gap-1 text-muted col-span-2">
              <UIcon name="i-mdi-hand-back-left" class="w-4 h-4" />
              <span>{{ t('penalties') }}:</span>
              <strong class="text-highlighted ml-auto">{{ player.penalties }}</strong>
            </div>
          </div>
        </div>
      </UCard>

      <div v-if="filteredRows.length === 0 && !loading" class="text-center py-8 text-muted">
        {{ t('noData') }}
      </div>
    </div>

    <!-- Desktop View (Table) -->
    <div class="hidden md:block">
      <UTable
        v-model:sorting="sorting" :data="filteredRows" :columns="columns" :loading="loading"
        :enable-multi-sort="props.enableMultiSort" class="flex-1 max-h-[624px]" sticky
      />
    </div>
  </div>
</template>
