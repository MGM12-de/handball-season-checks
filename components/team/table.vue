<template>
  <div>
    <UTable :rows="teams" :columns="columns" :loading="teamsPending" @select="onRowSelected" />
  </div>
</template>

<script lang="ts" setup>
import type { Team } from '~/types';
const props = defineProps({
  teamId: {
    type: String,
    required: true
  }
})
const { teamId } = props;

const columns = [{
  key: "name",
  label: "Name"
}, {
  key: "defaultTournament.name",
  label: "Liga"
}, {
  key: "defaultTournament.acronym",
  label: "Liga"
}]

const { data: teams, pending: teamsPending, error: teamsError, refresh: teamsRefresh } = await useAsyncData(
  `${teamId}/teams`,
  () => $fetch("/api/dhb/teams", {
    query: { id: teamId }
  })
) as unknown as { data: Team[], pending: boolean, error: any, refresh: Function }



const onRowSelected = (row: Team) => {
  navigateTo(`/team/details/${row.id}`)
}

</script>

<style></style>