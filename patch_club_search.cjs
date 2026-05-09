const fs = require('node:fs')

const file = 'app/components/club/search.vue'
let content = fs.readFileSync(file, 'utf8')

const replacement = `
<template>
  <div class="flex flex-col flex-1 w-full gap-6">
    <UForm class="space-y-4" :state="state" @submit="onSearch">
      <div class="flex flex-col sm:flex-row gap-4 items-end">
        <UFormField :label="t('clubName')" class="w-full sm:flex-1">
          <UInput v-model="state.clubName" placeholder="THW Kiel" @keydown.enter="onSearch" />
        </UFormField>
        <UButton type="submit" icon="i-lucide-search" class="w-full sm:w-auto flex justify-center">
          {{ t('search') }}
        </UButton>
      </div>
    </UForm>

    <div class="block md:hidden space-y-4">
      <div v-if="loading" class="space-y-4">
        <USkeleton v-for="i in 3" :key="i" class="h-24 w-full" />
      </div>
      <UCard v-for="club in clubs" v-else :key="club.id" class="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" @click="navigateTo(\`/club/details/\${club.id}\`)">
        <div class="flex items-center gap-4">
          <UAvatar :src="club.logo" :alt="club.acronym" size="lg" class="shrink-0 bg-white" />
          <div class="flex flex-col flex-1 min-w-0">
            <div class="font-bold text-lg truncate">{{ club.name }}</div>
            <div class="text-sm text-gray-500 flex items-center gap-2 mt-1">
              <UBadge v-if="club.acronym" :label="club.acronym" size="xs" variant="subtle" />
              <div v-if="club.organization" class="flex items-center gap-1 ml-auto">
                <UAvatar :src="club.organization.logo" :alt="club.organization.name" size="2xs" class="bg-white" />
                <span class="truncate max-w-[100px]">{{ club.organization.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </UCard>

      <div v-if="clubs && clubs.length === 0 && !loading && state.clubName" class="text-center py-8 text-gray-500">
        {{ t('noData') }}
      </div>
    </div>

    <div class="hidden md:block">
      <UTable v-model:column-visibility="columnVisibility" :data="clubs" :columns="columns" :loading="loading"
        @select="onRowSelected" />
    </div>
  </div>
</template>
`

content = content.replace(/<template>[\s\S]*?<\/template>/, replacement.trim())
fs.writeFileSync(file, content)
