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
      console.log('row', row.original.team.id, props.teamId)
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
    <UTable :data="props.data" :columns="columns" :loading="props.loading" sticky :meta="meta" />
  </div>
</template>

<style></style>
