<script lang="ts" setup>
const props = defineProps({
  teamId: {
    type: String,
    required: true,
  },
})
const standing = ref()

const { data, status } = await useAsyncData(
  () => `team/${props.teamId}/standing`,
  () => $fetch('/api/dhb/team/standing', {
    query: { id: props.teamId },
  }),
  { watch: [() => props.teamId] },
)
standing.value = data.value
</script>

<template>
  <div>
    <SharedStandingTable :data="standing || []" :loading="status === 'pending'" />
  </div>
</template>

<style></style>
