<template>
  <div>
    <UPage>
      <UPageHeader :title="team.name" :headline="team.defaultTournament.name" />
      <UPageBody>
        <UTabs :items="items" class="w-full">
          <template #default="{ item, index, selected }">
            <div class="flex items-center gap-2 relative truncate">
              <UIcon :name="item.icon" class="w-4 h-4 flex-shrink-0" />

              <span class="truncate">{{ item.label }}</span>

              <span v-if="selected" class="absolute -right-4 w-2 h-2 rounded-full bg-primary-500 dark:bg-primary-400" />
            </div>
          </template>
          <template #standing>
            <TeamStanding :teamId="team.id" />
          </template>

          <template #games>
            <TeamGames :games="games || []" :games-pending="gamesPending" />
          </template>
          <template #stats>
            <TeamPrognose :teamId="team.id" :games="games || []" :games-pending="gamesPending" />
          </template>
        </UTabs>
      </UPageBody>
    </UPage>

  </div>
</template>

<script lang="ts" setup>
import type { Team } from '~/types';
const route = useRoute()
let team = ref()

const items = [{
  slot: 'standing',
  label: 'Standing',
  icon: 'i-mdi-trophy'
}, {
  slot: 'games',
  label: 'Games',
  icon: 'i-mdi-controller'
}, {
  slot: 'stats',
  label: 'Statistics',
  icon: 'i-mdi-chart-bar'
}]

const { data, pending, error, refresh } = await useAsyncData(
  `team/${route.params.id}`,
  () => $fetch("/api/dhb/team", {
    query: { id: route.params.id }
  })
)
team = data

const { data: games, pending: gamesPending } = await useAsyncData(
  `team/${route.params.id}/games`,
  () => $fetch("/api/dhb/team/games", {
    query: { id: route.params.id }
  })
)
</script>

<style></style>