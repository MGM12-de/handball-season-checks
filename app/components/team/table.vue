<script lang="ts" setup>
import type { Team } from '~/types'

const props = defineProps({
  clubId: {
    type: String,
    required: true,
  },
})
const { clubId } = props

const columns = [{
  key: 'name',
  label: 'Name',
}, {
  key: 'defaultTournament.name',
  label: 'Liga',
}, {
  key: 'defaultTournament.acronym',
  label: 'Acronym',
}]

const { data: teams, pending: teamsPending } = await useAsyncData(
  `${clubId}/teams`,
  () => $fetch('/api/dhb/teams', {
    query: { id: clubId },
  }),
) as unknown as { data: Team[], pending: boolean, error: any, refresh: () => object }

function onRowSelected(row: Team) {
  navigateTo(`/team/details/${row.id}`)
}
</script>

<template>
  <div>
    <UTable :rows="teams" :columns="columns" :loading="teamsPending" @select="onRowSelected" />
  </div>
</template>

<style></style>
