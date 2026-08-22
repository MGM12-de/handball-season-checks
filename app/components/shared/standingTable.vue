<script lang="ts" setup>
import type { TableColumn } from '@nuxt/ui'
import { h, resolveComponent } from 'vue'

interface Team {
  id: string
  name: string
  logo?: string
  acronym?: string
  [key: string]: any
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})
const { t } = useI18n()
const UAvatar = resolveComponent('UAvatar')

interface Props {
  data: Team[]
  loading?: boolean
  teamId?: string
}

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

const meta: TableMeta<Team> = {
  class: {
    tr: (row: Row<Team>) => {
      if (row.original.team.id === props.teamId) {
        return 'bg-primary/50 animate-pulse'
      }
      return ''
    },
  },
}
</script>

<template>
  <div>
    <!-- Mobile View (Cards) -->
    <div class="block md:hidden space-y-4">
      <div v-if="props.loading" class="space-y-4">
        <USkeleton v-for="i in 5" :key="i" class="h-24 w-full" />
      </div>
      <UCard v-for="(row, index) in props.data" v-else :key="row.team?.id || index" class="p-2" :class="[row.team?.id === props.teamId ? 'ring ring-primary/50 bg-primary/5' : '']">
        <div class="flex items-center gap-4">
          <div class="font-bold text-lg w-6 text-center">
            {{ row.rank }}
          </div>
          <UAvatar v-if="row.team?.logo" :src="row.team.logo" :alt="row.team?.name" size="md" class="shrink-0 bg-white" />
          <div class="flex-1 min-w-0">
            <div class="font-semibold text-base truncate">
              {{ row.team?.name }}
            </div>
            <div class="text-sm text-muted mt-1 flex flex-wrap gap-x-3 gap-y-1">
              <span>{{ t('points') }}: <strong class="text-highlighted">{{ row.points }}</strong></span>
              <span>{{ t('games') }}: {{ row.games }}</span>
              <span>{{ t('goals') }}: {{ row.goals }}:{{ row.goalsAgainst }}</span>
            </div>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Desktop View (Table) -->
    <div class="hidden md:block">
      <UTable :data="props.data" :columns="columns" :loading="props.loading" sticky :meta="meta" />
    </div>
  </div>
</template>

<style scoped>
:deep(img) {
  object-fit: contain !important;
  object-position: center !important;
}
</style>
