<script lang="ts" setup>
const props = defineProps({
  teamId: {
    type: String,
    required: true,
  },
})

const { data: standing, status } = await useLazyAsyncData(
  `team/${props.teamId}/standing`,
  () => $fetch('/api/dhb/team/standing', {
    query: { id: props.teamId },
  }),
  { watch: [() => props.teamId] },
)
</script>

<template>
  <div>
    <SharedStandingTable :data="standing || []" :loading="status === 'pending'" :team-id="props.teamId" />
  </div>
</template>

<style></style>
