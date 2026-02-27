<script lang="ts" setup>
const route = useRoute()
const router = useRouter()
const team = ref()
const { t } = useI18n()
const requestURL = useRequestURL()

const items = [{
  slot: 'standing',
  label: t('standing'),
  icon: 'i-mdi-trophy',
}, {
  slot: 'games',
  label: t('games'),
  icon: 'i-mdi-controller',
}, {
  slot: 'stats',
  label: t('stats'),
  icon: 'i-mdi-chart-bar',
}, {
  slot: 'lineup',
  label: t('lineup'),
  icon: 'i-mdi-account-group',
}]

const availableTabs = items.map(item => item.slot)
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

const { data } = await useAsyncData(
  `team/${route.params.id}`,
  () => $fetch('/api/dhb/team', {
    query: { id: route.params.id },
  }),
)
team.value = data.value

const seoTitle = computed(() => {
  const tournamentAcronym = team.value?.defaultTournament?.acronym
  const teamName = team.value?.name

  if (tournamentAcronym && teamName) {
    return `${tournamentAcronym} - ${teamName} | ${t('siteTitle')}`
  }

  return `${t('team')} | ${t('siteTitle')}`
})

const seoDescription = computed(() => team.value?.defaultTournament?.name || t('siteDescription'))
const ogImage = computed(() => team.value?.logo || team.value?.organization?.logo || undefined)
const canonicalUrl = computed(() => new URL(route.fullPath, requestURL.origin).toString())

useSeoMeta({
  title: seoTitle,
  description: seoDescription,
  ogTitle: seoTitle,
  ogDescription: seoDescription,
  ogImage,
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: seoTitle,
  twitterDescription: seoDescription,
  twitterImage: ogImage,
})

useHead({
  link: [{ rel: 'canonical', href: canonicalUrl }],
})

const { data: games, pending: gamesPending } = await useAsyncData(
  `team/${route.params.id}/games`,
  () => $fetch('/api/dhb/team/games', {
    query: { id: route.params.id },
  }),
)
</script>

<template>
  <div>
    <UPage>
      <UPageHeader :title="team.name" :headline="team.defaultTournament.name" />
      <UPageBody>
        <UTabs v-model="activeTab" :items="items" value-key="slot" class="w-full" variant="link">
          <template #default="{ item }">
            <div class="flex items-center gap-2 relative truncate">
              <!-- <UIcon :name="item.icon" class="w-4 h-4 flex-shrink-0" /> -->

              <span class="truncate">{{ item.label }}</span>

              <span class="absolute -right-4 w-2 h-2 rounded-full bg-primary-500 dark:bg-primary-400" />
            </div>
          </template>
          <template #standing>
            <TeamStanding :team-id="team.id" />
          </template>

          <template #games>
            <TeamGames :games="games || []" :games-pending="gamesPending" />
          </template>
          <template #stats>
            <TeamPrognose :team-id="team.id" :games="games || []" :games-pending="gamesPending"
              :tournament-id="team.defaultTournament.id" />
          </template>

          <template #lineup>
            <TeamLineup :team-id="team.id" />
          </template>
        </UTabs>
      </UPageBody>
    </UPage>
  </div>
</template>

<style></style>
