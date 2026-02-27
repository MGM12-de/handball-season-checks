<script lang="ts" setup>
const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const requestURL = useRequestURL()

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

const availableTabs = items.filter(item => !item.disabled).map(item => item.slot)
const fallbackTab = availableTabs[0] || 'standing'
function getRouteTab() {
  if (Array.isArray(route.query.tab)) {
    return route.query.tab[0]
  }

  return route.query.tab
}

const activeTab = ref(
  typeof getRouteTab() === 'string' && availableTabs.includes(getRouteTab() as string)
    ? (getRouteTab() as string)
    : fallbackTab,
)

watch(activeTab, (tab) => {
  if (!import.meta.client) {
    return
  }

  const currentTab = getRouteTab()
  if (currentTab === tab) {
    return
  }

  router.replace({
    query: {
      ...route.query,
      tab,
    },
  })
}, { immediate: true })

watch(() => route.query.tab, () => {
  const tab = getRouteTab()
  const nextTab = typeof tab === 'string' && availableTabs.includes(tab) ? tab : fallbackTab

  if (nextTab !== activeTab.value) {
    activeTab.value = nextTab
  }
})

const { data: tournament } = await useLazyAsyncData(
  `tournament/${route.params.id}`,
  () => $fetch('/api/dhb/tournament', {
    query: { id: route.params.id },
  }),
)

const { data: tournamentTable, status: tournamentTableStatus } = await useLazyAsyncData(
  `tournament/${route.params.id}/table`,
  () => $fetch('/api/dhb/tournament/table', {
    query: { id: route.params.id },
  }),
)

const { data: tournamentLineup, status: tournamentLineupStatus } = await useLazyAsyncData(
  `tournament/${route.params.id}/lineup`,
  () => $fetch('/api/dhb/tournament/lineup', {
    query: { id: route.params.id },
  }),
)

const seoTitle = computed(() => {
  const tournamentName = tournament.value?.name || t('tournament')
  return `${tournamentName} | ${t('siteTitle')}`
})

const seoDescription = computed(() => {
  const acronym = tournament.value?.acronym
  const tournamentName = tournament.value?.name

  if (acronym && tournamentName) {
    return `${acronym} · ${tournamentName}`
  }

  return t('siteDescription')
})

const canonicalUrl = computed(() => new URL(route.fullPath, requestURL.origin).toString())

useSeoMeta({
  title: seoTitle,
  description: seoDescription,
  ogTitle: seoTitle,
  ogDescription: seoDescription,
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: seoTitle,
  twitterDescription: seoDescription,
})

useHead({
  link: [{ rel: 'canonical', href: canonicalUrl }],
})
</script>

<template>
  <UPage>
    <UPageHeader :headline="tournament.acronym" :title="tournament.name" description="" />
    <UPageBody>
      <UTabs v-model="activeTab" :items="items" value-key="slot" class="w-full">
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
