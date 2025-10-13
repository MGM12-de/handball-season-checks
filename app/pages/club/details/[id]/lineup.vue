<script lang="ts" setup>
const route = useRoute()

const { data: lineup, pending } = await useAsyncData(
  `club-lineup/${route.params.id}`,
  () => $fetch('/api/dhb/club/lineup', {
    query: { id: route.params.id },
  }),
)

// Get club info for the header
const { data: club } = await useAsyncData(
  `club/${route.params.id}`,
  () => $fetch('/api/dhb/club', {
    query: { id: route.params.id },
  }),
)

useSeoMeta({
  title: `${club.value?.name} - Lineup`,
  description: `Player lineup and statistics for ${club.value?.name}`,
})
</script>

<template>
  <div>
    <UPage>
      <UPageHeader headline="Club Lineup" :title="`${club?.name} - Players`" />
      <UPageBody>
        <div v-if="pending" class="flex justify-center">
          <UIcon name="i-lucide-loader-2" class="animate-spin" />
          Loading lineup...
        </div>

        <div v-else-if="lineup && lineup.length > 0" class="space-y-6">
          <div class="grid gap-4">
            <div v-for="player in lineup" :key="`${player.firstname}-${player.lastname}-${player.number}`"
              class="border rounded-lg p-4 bg-white shadow-sm">
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <h3 class="font-semibold text-lg">
                    {{ player.firstname }} {{ player.lastname }}
                  </h3>
                  <div class="text-sm text-gray-600 mt-1">
                    <span class="inline-block mr-4">
                      <strong>Position:</strong> {{ player.position }}
                    </span>
                    <span class="inline-block mr-4">
                      <strong>Number:</strong> {{ player.number }}
                    </span>
                    <span class="inline-block">
                      <strong>Games:</strong> {{ player.gamesPlayed }}
                    </span>
                  </div>
                </div>

                <!-- Stats -->
                <div class="text-right">
                  <div class="text-2xl font-bold text-blue-600">
                    {{ player.goals }}
                  </div>
                  <div class="text-xs text-gray-500">
                    Goals
                  </div>
                </div>
              </div>

              <!-- Detailed Stats -->
              <div class="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div class="bg-gray-50 p-2 rounded">
                  <div class="font-medium">
                    {{ player.penaltyGoals }}
                  </div>
                  <div class="text-xs text-gray-600">
                    Penalty Goals
                  </div>
                </div>
                <div class="bg-yellow-50 p-2 rounded">
                  <div class="font-medium">
                    {{ player.yellowCards }}
                  </div>
                  <div class="text-xs text-gray-600">
                    Yellow Cards
                  </div>
                </div>
                <div class="bg-red-50 p-2 rounded">
                  <div class="font-medium">
                    {{ player.redCards }}
                  </div>
                  <div class="text-xs text-gray-600">
                    Red Cards
                  </div>
                </div>
                <div class="bg-blue-50 p-2 rounded">
                  <div class="font-medium">
                    {{ player.blueCards }}
                  </div>
                  <div class="text-xs text-gray-600">
                    Blue Cards
                  </div>
                </div>
              </div>

              <!-- Teams -->
              <div v-if="player.teams && player.teams.length > 0" class="mt-3">
                <div class="text-sm font-medium text-gray-700 mb-2">
                  Teams:
                </div>
                <div class="flex flex-wrap gap-2">
                  <span v-for="team in player.teams" :key="team.id"
                    class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {{ team.name }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-8 text-gray-500">
          No lineup data available for this club.
        </div>
      </UPageBody>
    </UPage>
  </div>
</template>

<style></style>
