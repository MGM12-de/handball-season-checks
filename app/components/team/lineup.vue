<script lang="ts" setup>
interface Props {
  teamId: string
}

const props = defineProps<Props>()

const { data: teamLineup, status, error } = await useLazyAsyncData(
  `team/${props.teamId}/lineup`,
  () => $fetch('/api/dhb/team/lineup', {
    query: { id: props.teamId },
  }),
  {
    lazy: false,
  },
)
</script>

<template>
  <div class="w-full">
    <UAlert v-if="error" icon="i-lucide-alert-circle" color="error" variant="subtle" title="Error loading lineup"
      :description="error.message" />

    <SharedLineupTable :data="teamLineup || []" :loading="status === 'pending'" :show-teams="false" />
  </div>
</template>
