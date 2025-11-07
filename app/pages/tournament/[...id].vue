<script lang="ts" setup>
const route = useRoute()
const { t } = useI18n()

useSeoMeta({
  title: t('tournament'),
  description: '',
})

const items = [{
  slot: 'standing',
  header: t('standing'),
  icon: 'i-mdi-trophy',
}, {
  slot: 'stats',
  header: t('stats'),
  icon: 'i-mdi-chart-bar',
  disabled: true,
}, {
  slot: 'lineup',
  header: t('lineup'),
  icon: 'i-mdi-account-group',
}]

const { data: tournament } = await useAsyncData(
  `tournament/${route.params.id}`,
  () => $fetch('/api/dhb/tournament', {
    query: { id: route.params.id },
  }),
)

const { data: tournamentTable, status: tournamentTableStatus } = await useAsyncData(
  `tournament/${route.params.id}/table`,
  () => $fetch('/api/dhb/tournament/table', {
    query: { id: route.params.id },
  }),
)

const { data: tournamentLineup, status: tournamentLineupStatus } = await useAsyncData(
  `tournament/${route.params.id}/lineup`,
  () => $fetch('/api/dhb/tournament/lineup', {
    query: { id: route.params.id },
  }),
)
</script>

<template>
  <UPage>
    <UPageHeader :headline="tournament.acronym" :title="tournament.name" description="" />
    <UPageBody>
      <UTabs :items="items" class="w-full">
        <template #standing>
          <SharedStandingTable :data="tournamentTable || []" :loading="tournamentTableStatus === 'pending'" />
        </template>
        <template #stats>
          <div>Stats</div>
        </template>
        <template #lineup>
          <SharedLineupTable :data="tournamentLineup || []" :loading="tournamentLineupStatus === 'pending'"
            :show-club="true" />
        </template>
      </UTabs>
    </UPageBody>
  </UPage>
</template>

<style></style>
