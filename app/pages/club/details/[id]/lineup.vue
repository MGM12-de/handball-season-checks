<script lang="ts" setup>
const route = useRoute()
const clubId = route.params.id as string

const { data: clubLineup, status: clubLineupState } = await useAsyncData(
  `club/${clubId}/lineup`,
  () => $fetch('/api/dhb/club/lineup', {
    query: { id: clubId },
  }),
)
</script>

<template>
  <div>
    <h1>{{ $t('clubLineup') }}</h1>

    <SharedLineupTable :data="clubLineup || []" :loading="clubLineupState === 'pending'" :show-teams="true"
      :show-search="true" />
  </div>
</template>
