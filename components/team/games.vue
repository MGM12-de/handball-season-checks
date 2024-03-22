<template>
  <div>
    <UTable :rows="games" :loading="pending" :columns="columns" />
  </div>
</template>

<script lang="ts" setup>
const route = useRoute()
let games = ref()

const columns = [{ key: 'startsAt', label: 'Date' },
{ key: 'homeTeam.name', label: 'Home Team' },
{ key: 'awayTeam.name', label: 'Away Team' },
{ key: 'field.name', label: 'Location' },
{ key: 'remarks', label: 'Remarks' },
{ key: 'result', label: 'Result' }]

const { data, pending, error, refresh } = await useAsyncData(
  `team/${route.params.id}/games`,
  () => $fetch("/api/dhb/team/games", {
    query: { id: route.params.id }
  })
)
games = data
</script>

<style></style>