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
  label: 'Liga',
}]

const { data: teams, pending: teamsPending, error: teamsError, refresh: teamsRefresh } = await useAsyncData(
  `${clubId}/teams`,
  () => $fetch('/api/dhb/teams', {
    query: { id: clubId },
  }),
) as unknown as { data: Team[], pending: boolean, error: any, refresh: Function }

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
