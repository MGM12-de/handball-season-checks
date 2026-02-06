<script lang="ts" setup>
interface Props {
  teamId: string
}

const props = defineProps<Props>()

const { data: teamLineup, status, error } = await useAsyncData(
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

    <div v-else-if="status === 'pending'" class="space-y-2">
      <USkeleton class="h-12 w-full" />
      <USkeleton class="h-12 w-full" />
    </div>

    <SharedLineupTable v-else :data="teamLineup || []" :loading="status === 'pending'" :show-teams="false" />
  </div>
</template>
