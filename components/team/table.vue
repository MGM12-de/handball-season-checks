<template>
  <div>
    <UTable :rows="teams" :columns="columns" :loading="teamsPending" @select="onRowSelected" />
  </div>
</template>

<script lang="ts" setup>
import type { Team } from '~/types';

const route = useRoute()
const columns = [{
  key: "name",
  label: "Name"
}, {
  key: "defaultTournament.name",
  label: "Liga"
}]

const { data: teams, pending: teamsPending, error: teamsError, refresh: teamsRefresh } = await useAsyncData(
  `${route.params.id}/teams`,
  () => $fetch("/api/dhb/teams", {
    query: { id: route.params.id }
  })
) as unknown as { data: Team[], pending: boolean, error: any, refresh: Function }



const onRowSelected = (row: Team) => {
  navigateTo(`/team/details/${row.id}`)
}
</script>

<style></style>