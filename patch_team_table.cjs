const fs = require('node:fs')

const file = 'app/components/team/table.vue'
let content = fs.readFileSync(file, 'utf8')

const replacement = `
<template>
  <div>
    <!-- Mobile View (Cards) -->
    <div class="block md:hidden space-y-4">
      <div v-if="teamsPending" class="space-y-4">
        <USkeleton v-for="i in 3" :key="i" class="h-24 w-full" />
      </div>
      <UCard v-for="team in teams" v-else :key="team.id" class="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" @click="navigateTo(\`/team/details/\${team.id}\`)">
        <div class="flex flex-col gap-1">
          <div class="font-bold text-lg text-primary-600 dark:text-primary-400">
            {{ team.name }}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
            <UIcon name="i-heroicons-trophy" class="w-4 h-4" />
            <span>{{ team.defaultTournament?.name || t('league') }}</span>
            <UBadge v-if="team.defaultTournament?.acronym" :label="team.defaultTournament.acronym" size="xs" variant="subtle" />
          </div>
        </div>
      </UCard>
    </div>

    <!-- Desktop View (Table) -->
    <div class="hidden md:block">
      <UTable v-model:column-visibility="columnVisibility" :data="teams" :columns="columns" :loading="teamsPending"
        @select="onRowSelected" />
    </div>
  </div>
</template>
`

content = content.replace(/<template>[\s\S]*?<\/template>/, replacement.trim())
fs.writeFileSync(file, content)
