<script lang="ts" setup>
import { useFavorites } from '~/composables/useFavorites'

const { t } = useI18n()
const { favoriteClubs, favoriteTeams } = useFavorites()
</script>

<template>
  <UPage>
    <UPageHeader :title="t('myFavorites')" />

    <UPageBody>
      <div v-if="favoriteClubs.length === 0 && favoriteTeams.length === 0" class="text-center py-12 text-gray-500">
        <UIcon name="i-lucide-star" class="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p class="text-lg">
          {{ t('noFavoritesYet') }}
        </p>
      </div>

      <div v-else class="space-y-12">
        <section v-if="favoriteTeams.length > 0">
          <h2 class="text-2xl font-bold mb-6 flex items-center gap-2">
            <UIcon name="i-lucide-users" class="w-6 h-6" />
            {{ t('favoriteTeams') }}
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <UCard v-for="team in favoriteTeams" :key="team.id" class="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" @click="navigateTo(`/team/details/${team.id}`)">
              <div class="flex items-center gap-4">
                <UAvatar :src="team.logo" :alt="team.name" size="lg" class="shrink-0 bg-white" />
                <div class="flex flex-col flex-1 min-w-0">
                  <div class="font-bold text-lg truncate">
                    {{ team.name }}
                  </div>
                  <div v-if="team.tournamentAcronym" class="text-sm text-gray-500 mt-1">
                    <UBadge :label="team.tournamentAcronym" size="xs" variant="subtle" />
                  </div>
                </div>
              </div>
            </UCard>
          </div>
        </section>

        <section v-if="favoriteClubs.length > 0">
          <h2 class="text-2xl font-bold mb-6 flex items-center gap-2">
            <UIcon name="i-lucide-shield" class="w-6 h-6" />
            {{ t('favoriteClubs') }}
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <UCard v-for="club in favoriteClubs" :key="club.id" class="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" @click="navigateTo(`/club/details/${club.id}`)">
              <div class="flex items-center gap-4">
                <UAvatar :src="club.logo" :alt="club.acronym" size="lg" class="shrink-0 bg-white" />
                <div class="flex flex-col flex-1 min-w-0">
                  <div class="font-bold text-lg truncate">
                    {{ club.name }}
                  </div>
                  <div class="text-sm text-gray-500 flex items-center gap-2 mt-1">
                    <UBadge v-if="club.acronym" :label="club.acronym" size="xs" variant="subtle" />
                    <span v-if="club.organizationName" class="truncate max-w-[100px] ml-auto">
                      {{ club.organizationName }}
                    </span>
                  </div>
                </div>
              </div>
            </UCard>
          </div>
        </section>
      </div>
    </UPageBody>
  </UPage>
</template>
