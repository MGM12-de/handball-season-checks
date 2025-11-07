<script lang="ts" setup>
import type { TableColumn, TableRow } from '@nuxt/ui'
import { h, resolveComponent } from 'vue'

const UAvatar = resolveComponent('UAvatar')

const route = useRoute()
const { t } = useI18n()

useSeoMeta({
  title: t('tournament'),
  description: '',
})

const items = [{
  slot: 'standing',
  header: t('standing'),
  icon: 'i-mdi-trophy',
}, {
  slot: 'stats',
  header: t('stats'),
  icon: 'i-mdi-chart-bar',
  disabled: true,
}, {
  slot: 'lineup',
  header: t('lineup'),
  icon: 'i-mdi-account-group',
}]

const { data: tournament } = await useAsyncData(
  `tournament/${route.params.id}`,
  () => $fetch('/api/dhb/tournament', {
    query: { id: route.params.id },
  }),
)

const columns: TableColumn<any>[] = [{ accessorKey: 'rank', header: t('rank') }, {
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
}, { accessorKey: 'team.name', header: t('team') }, { accessorKey: 'points', header: t('points') }, { accessorKey: 'games', header: t('games') }, { accessorKey: 'wins', header: t('wins') }, { accessorKey: 'draws', header: t('draws') }, { accessorKey: 'losses', header: t('losses') }, { accessorKey: 'goals', header: t('goals') }, { accessorKey: 'goalsAgainst', header: t('goalsAgainst') }, { accessorKey: 'goalDifference', header: t('goalDifference') }]

const { data: tournamentTable, status: tournamentTableStatus } = await useAsyncData(
  `tournament/${route.params.id}/table`,
  () => $fetch('/api/dhb/tournament/table', {
    query: { id: route.params.id },
  }),
)

const { data: tournamentLineup, status: tournamentLineupStatus } = await useAsyncData(
  `tournament/${route.params.id}/lineup`,
  () => $fetch('/api/dhb/tournament/lineup', {
    query: { id: route.params.id },
  }),
)
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
          <SharedLineupTable :data="tournamentLineup || []" :loading="tournamentLineupStatus === 'pending'"
            :show-club="true" />
        </template>
      </UTabs>
    </UPageBody>
  </UPage>
</template>

<style></style>
