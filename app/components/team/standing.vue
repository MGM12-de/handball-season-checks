<script lang="ts" setup>
import type { TableColumn } from '@nuxt/ui'

const props = defineProps({
  teamId: {
    type: String,
    required: true,
  },
})
const standing = ref()
const { t } = useI18n()
const { teamId } = props

const columns: TableColumn<any>[] = [{ accessorKey: 'rank', header: t('rank') }, { accessorKey: 'team.name', header: t('team') }, { accessorKey: 'points', header: t('points') }, { accessorKey: 'games', header: t('games') }, { accessorKey: 'wins', header: t('wins') }, { accessorKey: 'draws', header: t('draws') }, { accessorKey: 'losses', header: t('losses') }, { accessorKey: 'goals', header: t('goals') }, { accessorKey: 'goalsAgainst', header: t('goalsAgainst') }, { accessorKey: 'goalDifference', header: t('goalDifference') }]

const { data, status } = await useAsyncData(
  `team/${teamId}/standing`,
  () => $fetch('/api/dhb/team/standing', {
    query: { id: teamId },
  }),
)
standing.value = data.value
</script>

<template>
  <div>
    <UTable :data="standing" :loading="status === 'pending'" :columns="columns" />
  </div>
</template>

<style></style>
