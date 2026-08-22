<script lang="ts" setup>
import type { TableColumn, TableRow } from '@nuxt/ui'
import type { Team } from '../../../types'
import { h } from 'vue'
import { UButton } from '#components'
import { useFavorites } from '~/composables/useFavorites'

const props = defineProps({
  clubId: {
    type: String,
    required: true,
  },
})
const { clubId } = props
const { t } = useI18n()
const { isFavoriteTeam, toggleFavoriteTeam } = useFavorites()

const columns: TableColumn<Team>[] = [{
  accessorKey: 'id',
  header: t('id'),
}, {
  accessorKey: 'name',
  header: t('name'),
}, {
  accessorKey: 'league.name',
  header: t('league'),
}, {
  id: 'favorite',
  header: '',
  cell: ({ row }) => {
    const team = row.original
    const isFav = isFavoriteTeam(team.id.toString())
    return h(UButton, {
      icon: isFav ? 'i-heroicons-star-solid' : 'i-heroicons-star',
      color: isFav ? 'primary' : 'neutral',
      variant: 'ghost',
      title: isFav ? t('removeFromFavorites') : t('addToFavorites'),
      onClick: (e: Event) => {
        e.stopPropagation()
        toggleFavoriteTeam({
          id: team.id.toString(),
          name: team.name,
          logo: team.logo,
        })
      },
    })
  },
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

const unknownLeagueLabel = computed(() => t('noLeague'))

const sortedTeams = computed(() => {
  return [...(teams.value || [])].sort((a, b) => {
    const leagueA = a.league?.name ?? ''
    const leagueB = b.league?.name ?? ''
    return leagueA.localeCompare(leagueB) || a.name.localeCompare(b.name)
  })
})

const groupedTeams = computed(() => {
  const groups = new Map<string, Team[]>()

  for (const team of sortedTeams.value) {
    const key = team.league?.name || unknownLeagueLabel.value
    const group = groups.get(key) ?? []
    group.push(team)
    groups.set(key, group)
  }

  return Array.from(groups.entries()).map(([league, teamsInLeague]) => ({ league, teams: teamsInLeague }))
})

function onRowSelected(e: Event, row: TableRow<Team>) {
  const teamId = row.getValue('id')
  navigateTo(`/team/details/${teamId}`)
}
</script>

<template>
  <div>
    <!-- Mobile View (Cards, grouped by league) -->
    <div class="block md:hidden space-y-6">
      <div v-if="teamsPending" class="space-y-4">
        <USkeleton v-for="i in 3" :key="i" class="h-24 w-full" />
      </div>
      <div v-for="group in groupedTeams" v-else :key="group.league" class="space-y-3">
        <h3 class="text-sm font-semibold text-muted uppercase tracking-wide">
          {{ group.league }}
        </h3>
        <div class="space-y-3">
          <UCard v-for="team in group.teams" :key="team.id" class="p-4 cursor-pointer hover:bg-elevated transition-colors" @click="navigateTo(`/team/details/${team.id}`)">
            <div class="flex justify-between items-center">
              <div class="font-bold text-lg text-primary">
                {{ team.name }}
              </div>
              <UButton
                :icon="isFavoriteTeam(team.id.toString()) ? 'i-heroicons-star-solid' : 'i-heroicons-star'"
                :color="isFavoriteTeam(team.id.toString()) ? 'primary' : 'neutral'"
                variant="ghost"
                class="ml-2"
                :title="isFavoriteTeam(team.id.toString()) ? t('removeFromFavorites') : t('addToFavorites')"
                @click.stop="toggleFavoriteTeam({ id: team.id.toString(), name: team.name, logo: team.logo })"
              />
            </div>
          </UCard>
        </div>
      </div>
    </div>

    <!-- Desktop View (Table) -->
    <div class="hidden md:block">
      <UTable
        v-model:column-visibility="columnVisibility" :data="sortedTeams" :columns="columns" :loading="teamsPending"
        @select="onRowSelected"
      />
    </div>
  </div>
</template>

<style></style>
