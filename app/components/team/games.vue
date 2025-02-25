<script lang="ts" setup>
const props = defineProps({
  games: {
    type: Array,
    required: true,
  },
  gamesPending: {
    type: Boolean,
    required: true,
  },
})
const { games, gamesPending } = props

const columns = [{ key: 'startsAt', label: 'Date' }, { key: 'field.name', label: 'Location' }, { key: 'homeTeam.name', label: 'Home Team' }, { key: 'awayTeam.name', label: 'Away Team' }, { key: 'result', label: 'Result' }, { key: 'remarks', label: 'Remarks' }]
</script>

<template>
  <div>
    <UTable :rows="games" :loading="gamesPending" :columns="columns">
    </UTable>
  </div>
</template>

<style></style>
