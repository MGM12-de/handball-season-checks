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

const route = useRoute()
let games = ref()

const { data, pending, error, refresh } = await useAsyncData(
  `team/${route.params.id}/games`,
  () => $fetch("/api/dhb/team/games", {
    query: { id: route.params.id }
  })
)
games = data
</script>

<style></style>