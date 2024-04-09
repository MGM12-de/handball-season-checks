<template>
  <div>
    <UTable :rows="games" :loading="pending" :columns="columns" />
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  teamId: {
    type: String,
    required: true
  }
})
const { teamId } = props;
let games = ref()

const columns = [{ key: 'startsAt', label: 'Date' },
{ key: 'field.name', label: 'Location' },
{ key: 'homeTeam.name', label: 'Home Team' },
{ key: 'awayTeam.name', label: 'Away Team' },
{ key: 'remarks', label: 'Remarks' },
{ key: 'result', label: 'Result' }]

const { data, pending, error, refresh } = await useAsyncData(
  `team/${teamId}/games`,
  () => $fetch("/api/dhb/team/games", {
    query: { id: teamId }
  })
)
games = data
</script>

<style></style>