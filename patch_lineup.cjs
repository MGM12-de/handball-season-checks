const fs = require('node:fs')

const file = 'app/components/shared/lineupTable.vue'
let content = fs.readFileSync(file, 'utf8')

const replacement = `
<template>
  <div>
    <div v-if="showSearch" class="flex px-3 py-3.5 border-b border-gray-200 dark:border-gray-700">
      <UInput v-model="q" :placeholder="t('filter')" />
    </div>

    <!-- Mobile View (Cards) -->
    <div class="block md:hidden space-y-4 p-3">
      <div v-if="loading" class="space-y-4">
        <USkeleton v-for="i in 5" :key="i" class="h-32 w-full" />
      </div>
      <UCard v-for="player in filteredRows" v-else :key="player.id" class="p-4">
        <div class="flex flex-col gap-2">
          <div class="font-bold text-lg border-b border-gray-100 dark:border-gray-800 pb-2 mb-1 flex justify-between items-center">
            <span>{{ player.firstname }} {{ player.lastname }}</span>
            <div v-if="showTeams && player.teams" class="flex gap-1 flex-wrap justify-end">
               <UBadge v-for="team in player.teams" :key="team.id" :label="team.acronym || team.name" size="sm" />
            </div>
            <div v-if="showClub && player.team" class="flex justify-end">
               <UBadge :label="player.team.name" size="sm" variant="outline" :avatar="{ src: player.team.logo || '', alt: player.team.name }" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-y-2 text-sm">
            <div class="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <UIcon name="i-mdi-whistle" class="w-4 h-4" />
              <span>{{ t('gamesPlayed') }}:</span>
              <strong class="text-gray-900 dark:text-white ml-auto">{{ player.gamesPlayed || 0 }}</strong>
            </div>

            <div class="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <UIcon name="i-mdi-soccer" class="w-4 h-4" />
              <span>{{ t('goals') }}:</span>
              <strong class="text-gray-900 dark:text-white ml-auto">{{ player.goals || 0 }}</strong>
            </div>

            <div class="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <UIcon name="i-mdi-chart-line" class="w-4 h-4" />
              <span>Ø:</span>
              <strong class="text-gray-900 dark:text-white ml-auto">{{ player.gamesPlayed && player.goals ? (player.goals / player.gamesPlayed).toFixed(2) : '0.00' }}</strong>
            </div>

            <div v-if="player.yellowCards" class="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <div class="w-3 h-4 bg-yellow-400 rounded-sm"></div>
              <span>{{ t('yellowCards') }}:</span>
              <strong class="text-gray-900 dark:text-white ml-auto">{{ player.yellowCards }}</strong>
            </div>

            <div v-if="player.redCards" class="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <div class="w-3 h-4 bg-red-500 rounded-sm"></div>
              <span>{{ t('redCards') }}:</span>
              <strong class="text-gray-900 dark:text-white ml-auto">{{ player.redCards }}</strong>
            </div>

            <div v-if="player.blueCards" class="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <div class="w-3 h-4 bg-blue-500 rounded-sm"></div>
              <span>{{ t('blueCards') }}:</span>
              <strong class="text-gray-900 dark:text-white ml-auto">{{ player.blueCards }}</strong>
            </div>

            <div v-if="player.penalties" class="flex items-center gap-1 text-gray-500 dark:text-gray-400 col-span-2">
              <UIcon name="i-mdi-hand-back-left" class="w-4 h-4" />
              <span>{{ t('penalties') }}:</span>
              <strong class="text-gray-900 dark:text-white ml-auto">{{ player.penalties }}</strong>
            </div>
          </div>
        </div>
      </UCard>

      <div v-if="filteredRows.length === 0 && !loading" class="text-center py-8 text-gray-500">
        {{ t('noData') }}
      </div>
    </div>

    <!-- Desktop View (Table) -->
    <div class="hidden md:block">
      <UTable v-model:sorting="sorting" :data="filteredRows" :columns="columns" :loading="loading"
        :enable-multi-sort="props.enableMultiSort" class="flex-1 max-h-[624px]" sticky />
    </div>
  </div>
</template>
`

content = content.replace(/<template>[\s\S]*?<\/template>/, replacement.trim())
fs.writeFileSync(file, content)
