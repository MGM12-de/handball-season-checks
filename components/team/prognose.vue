<template>
  <div>
    <UContainer>
      <UForm>
        <UFormGroup label="Möglicher Platz, wenn alle offene Spiele gewonnen werden">
          <UInput v-model="rankIfWinning" icon="i-mdi-trophy" disabled />
        </UFormGroup>
      </UForm>
    </UContainer>
  </div>
</template>

<script lang="ts" setup>
const rankIfWinning = ref('')
const props = defineProps({
  teamId: {
    type: String,
    required: true
  }
})
const { teamId } = props;
let games = ref()

const { data, pending, error, refresh } = await useAsyncData(
  `team/${teamId}/games`,
  () => $fetch("/api/dhb/team/games", {
    query: { id: teamId }
  })
)
games = data
</script>

<style></style>