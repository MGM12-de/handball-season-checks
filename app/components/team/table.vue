<script lang="ts" setup>
import type { TableColumn, TableRow } from '@nuxt/ui'
import type { Team } from '../../../types'

const props = defineProps({
  clubId: {
    type: String,
    required: true,
  },
})
const { clubId } = props

const columns: TableColumn<Team>[] = [{
  accessorKey: 'id',
  header: 'ID',
}, {
  accessorKey: 'name',
  header: 'Name',
}, {
  accessorKey: 'defaultTournament.name',
  header: 'Liga',
}, {
  accessorKey: 'defaultTournament.acronym',
  header: 'Acronym',
}]

const columnVisibility = ref({
  id: false,
})

const { data: teams, pending: teamsPending } = await useAsyncData(
  `${clubId}/teams`,
  () => $fetch('/api/dhb/teams', {
    query: { id: clubId },
  }),
) as unknown as { data: Team[], pending: boolean, error: any, refresh: () => object }

function onRowSelected(row: TableRow<Team>) {
  const teamId = row.getValue('id')
  navigateTo(`/team/details/${teamId}`)
}
</script>

<template>
  <div>
    <UTable v-model:column-visibility="columnVisibility" :data="teams" :columns="columns" :loading="teamsPending"
      @select="onRowSelected" />
  </div>
</template>

<style></style>
