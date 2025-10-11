<script lang="ts" setup>
import type { TableColumn, TableRow } from '@nuxt/ui'
import type { Column } from '@tanstack/vue-table'
import { h, resolveComponent } from 'vue'

const UButton = resolveComponent('UButton')
const UAvatar = resolveComponent('UAvatar')
const UDropdownMenu = resolveComponent('UDropdownMenu')

const route = useRoute()

useSeoMeta({
  title: `Tournament`,
  description: '',
})

const items = [{
  slot: 'standing',
  header: 'Standing',
  icon: 'i-mdi-trophy',
}, {
  slot: 'stats',
  header: 'Statistics',
  icon: 'i-mdi-chart-bar',
}, {
  slot: 'lineup',
  header: 'Lineup',
  icon: 'i-mdi-account-group',
}]

const { data: tournament } = await useAsyncData(
  `tournament/${route.params.id}`,
  () => $fetch('/api/dhb/tournament', {
    query: { id: route.params.id },
  }),
)

const columns: TableColumn<any>[] = [{ accessorKey: 'rank', header: 'Rank' }, {
  accessorKey: 'team.logo',
  header: '',
  cell: ({ row }) => {
    const logo = row.getValue('team_logo') as string
    const name = row.getValue('team_name') as string
    return h(UAvatar, {
      src: logo,
      alt: name,
      class: 'w-8 h-8',
      size: 'xl',
    })
  },
}, { accessorKey: 'team.name', header: 'Team' }, { accessorKey: 'points', header: 'Points' }, { accessorKey: 'games', header: 'Games' }, { accessorKey: 'wins', header: 'Wins' }, { accessorKey: 'draws', header: 'Draws' }, { accessorKey: 'losses', header: 'Losses' }, { accessorKey: 'goals', header: 'Goals' }, { accessorKey: 'goalsAgainst', header: 'Goals Against' }, { accessorKey: 'goalDifference', header: 'Goal Difference' }]

const { data: tournamentTable, status: tournamentTableStatus } = await useAsyncData(
  `tournament/${route.params.id}/table`,
  () => $fetch('/api/dhb/tournament/table', {
    query: { id: route.params.id },
  }),
)

const lineupCols: TableColumn<any>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => getHeader(column, 'Name'),
    cell: ({ row }) => `${row.original.firstname} ${row.original.lastname}`,
  },
  { accessorKey: 'team.name', header: ({ column }) => getHeader(column, 'Team') },
  { accessorKey: 'gamesPlayed', header: ({ column }) => getHeader(column, 'Games played') },
  { accessorKey: 'goals', header: ({ column }) => getHeader(column, 'Goals') },
  // { accessorKey: 'penaltyGoals', header: 'Penalty goals' }, { accessorKey: 'penaltyMissed', header: 'Penalty missed' },
  { accessorKey: 'yellowCards', header: ({ column }) => getHeader(column, 'Yellow Cards') },
  { accessorKey: 'penalties', header: ({ column }) => getHeader(column, 'Penalties') },
  { accessorKey: 'redCards', header: ({ column }) => getHeader(column, 'Red Cards') },
  { accessorKey: 'blueCards', header: ({ column }) => getHeader(column, 'Blue Cards') },
]

const { data: tournamentLineup, status: tournamentLineupStatus } = await useAsyncData(
  `tournament/${route.params.id}/lineup`,
  () => $fetch('/api/dhb/tournament/lineup', {
    query: { id: route.params.id },
  }),
)

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
  <UPage>
    <UPageHeader :headline="tournament.acronym" :title="tournament.name" description="" />
    <UPageBody>
      <UTabs :items="items" class="w-full">
        <template #standing>
          <UTable :data="tournamentTable" :columns="columns" :loading="tournamentTableStatus === 'pending'" sticky />
        </template>
        <template #stats>
          <div>Stats</div>
        </template>
        <template #lineup>
          <UTable v-model:sorting="sorting" :data="tournamentLineup" :columns="lineupCols"
            :loading="tournamentLineupStatus === 'pending'" class="flex-1" />
        </template>
      </UTabs>
    </UPageBody>
  </UPage>
</template>

<style></style>
