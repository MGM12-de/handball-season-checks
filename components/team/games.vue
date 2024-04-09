<template>
  <div>
    <UTable :rows="games" :loading="gamesPending" :columns="columns" />
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  games: {
    type: Array,
    required: true
  },
  gamesPending: {
    type: Boolean,
    required: true
  }
})
const { games, gamesPending } = props;

const columns = [{ key: 'startsAt', label: 'Date' },
{ key: 'field.name', label: 'Location' },
{ key: 'homeTeam.name', label: 'Home Team' },
{ key: 'awayTeam.name', label: 'Away Team' },
{ key: 'remarks', label: 'Remarks' },
{ key: 'result', label: 'Result' }]

</script>

<style></style>