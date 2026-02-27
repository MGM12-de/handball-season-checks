<script lang="ts" setup>
const { t } = useI18n()
const route = useRoute()
const requestURL = useRequestURL()

const seoTitle = computed(() => `${t('tournaments')} | ${t('siteTitle')}`)
const seoDescription = computed(() => t('siteDescription'))
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
    <UPageHeader :headline="t('tournament')" :title="t('tournaments')" :description="t('siteDescription')" />
    <UPageBody>
      <TournamentSearch />
    </UPageBody>
  </UPage>
</template>

<style></style>
