const fs = require('node:fs')

const file = 'app/components/shared/standingTable.vue'
let content = fs.readFileSync(file, 'utf8')

const replacement = `
<template>
  <div>
    <!-- Mobile View (Cards) -->
    <div class="block md:hidden space-y-4">
      <div v-if="props.loading" class="space-y-4">
        <USkeleton v-for="i in 5" :key="i" class="h-24 w-full" />
      </div>
      <UCard v-for="(row, index) in props.data" v-else :key="row.team?.id || index" class="p-2" :class="[row.team?.id === props.teamId ? 'ring ring-primary-500/50 bg-primary-50/50 dark:bg-primary-900/10' : '']">
        <div class="flex items-center gap-4">
          <div class="font-bold text-lg w-6 text-center">
            {{ row.rank }}
          </div>
          <UAvatar v-if="row.team?.logo" :src="row.team.logo" :alt="row.team?.name" size="md" class="shrink-0 bg-white" />
          <div class="flex-1 min-w-0">
            <div class="font-semibold text-base truncate">{{ row.team?.name }}</div>
            <div class="text-sm text-gray-500 dark:text-gray-400 mt-1 flex flex-wrap gap-x-3 gap-y-1">
              <span>{{ t('points') }}: <strong class="text-gray-900 dark:text-white">{{ row.points }}</strong></span>
              <span>{{ t('games') }}: {{ row.games }}</span>
              <span>{{ t('goals') }}: {{ row.goals }}:{{ row.goalsAgainst }}</span>
            </div>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Desktop View (Table) -->
    <div class="hidden md:block">
      <UTable :data="props.data" :columns="columns" :loading="props.loading" sticky :meta="meta" />
    </div>
  </div>
</template>
`

content = content.replace(/<template>[\s\S]*?<\/template>/, replacement.trim())
fs.writeFileSync(file, content)
