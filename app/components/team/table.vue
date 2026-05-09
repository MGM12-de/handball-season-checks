<script lang="ts" setup>
import type { TableColumn, TableRow } from '@nuxt/ui'
import type { Team } from '../../../types'

const props = defineProps({
  clubId: {
    type: String,
    required: true,
  },
})
const { clubId } = props
const { t } = useI18n()

const columns: TableColumn<Team>[] = [{
  accessorKey: 'id',
  header: t('id'),
}, {
  accessorKey: 'name',
  header: t('name'),
}, {
  accessorKey: 'defaultTournament.name',
  header: t('league'),
}, {
  accessorKey: 'defaultTournament.acronym',
  header: t('acronym'),
}]

const columnVisibility = ref({
  id: false,
})

const { data: teams, pending: teamsPending } = await useAsyncData(
  `${clubId}/teams`,
  () => $fetch('/api/dhb/teams', {
    query: { id: clubId },
  }),
) as unknown as { data: Team[], pending: boolean, error: any, refresh: () => object }

function onRowSelected(e: Event, row: TableRow<Team>) {
  const teamId = row.getValue('id')
  navigateTo(`/team/details/${teamId}`)
}
</script>

<template>
  <div>
    <!-- Mobile View (Cards) -->
    <div class="block md:hidden space-y-4">
      <div v-if="teamsPending" class="space-y-4">
        <USkeleton v-for="i in 3" :key="i" class="h-24 w-full" />
      </div>
      <UCard v-for="team in teams" v-else :key="team.id" class="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" @click="navigateTo(`/team/details/${team.id}`)">
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
      <UTable
        v-model:column-visibility="columnVisibility" :data="teams" :columns="columns" :loading="teamsPending"
        @select="onRowSelected"
      />
    </div>
  </div>
</template>

<style></style>
