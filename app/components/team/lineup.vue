<script lang="ts" setup>
const props = defineProps({
  teamId: {
    type: String,
    required: true,
  },
})

const { teamId } = props

const { data: teamLineup, status: teamLineupState } = await useAsyncData(
  `team/${teamId}/lineup`,
  () => $fetch('/api/dhb/team/lineup', {
    query: { id: teamId },
  }),
)
</script>

<template>
  <LineupTable :data="teamLineup || []" :loading="teamLineupState === 'pending'" :show-teams="false" />
</template>
