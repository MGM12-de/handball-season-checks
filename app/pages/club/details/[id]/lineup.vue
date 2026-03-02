<script lang="ts" setup>
const route = useRoute()
const clubId = route.params.id as string
const { t } = useI18n()
const requestURL = useRequestURL()

const { data: club } = await useAsyncData(
  `club/${clubId}/seo`,
  () => $fetch('/api/dhb/club', {
    query: { id: clubId },
  }),
)

const seoTitle = computed(() => `${t('clubLineup')} | ${t('siteTitle')}`)
const seoDescription = computed(() => t('clubLineup'))
const canonicalUrl = computed(() => new URL(route.fullPath, requestURL.origin).toString())
const defaultOgImage = computed(() => new URL('/favicon.svg', requestURL.origin).toString())
const ogImage = computed(() => club.value?.logo || club.value?.organization?.logo || defaultOgImage.value)

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

const { data: clubLineup, status: clubLineupState } = await useLazyAsyncData(
  `club/${clubId}/lineup`,
  () => $fetch('/api/dhb/club/lineup', {
    query: { id: clubId },
  }),
)
</script>

<template>
  <div>
    <h1>{{ $t('clubLineup') }}</h1>

    <SharedLineupTable :data="clubLineup || []" :loading="clubLineupState === 'pending'" :show-teams="true"
      :show-search="true" />
  </div>
</template>
