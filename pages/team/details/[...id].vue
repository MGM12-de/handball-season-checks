<template>
  <div>
    <UPage>
      <UPageHeader :title="team.name" :headline="team.defaultTournament.name" />
      <UPageBody>
        <TeamStanding />
        <br />
        <TeamGames />
      </UPageBody>
    </UPage>

  </div>
</template>

<script lang="ts" setup>
const route = useRoute()
let team = ref()

const { data, pending, error, refresh } = await useAsyncData(
  `team/${route.params.id}`,
  () => $fetch("/api/dhb/team", {
    query: { id: route.params.id }
  })
)
team = data
</script>

<style></style>