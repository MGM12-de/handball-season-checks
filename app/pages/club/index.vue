<script lang="ts" setup>
const { t } = useI18n()
const route = useRoute()
const requestURL = useRequestURL()

const seoTitle = computed(() => `${t('searchClub')} | ${t('siteTitle')}`)
const seoDescription = computed(() => t('searchClubDescription'))
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
    <UPageHeader :headline="t('handball')" :title="t('searchClub')" :description="t('searchClubDescription')" />
    <UPageBody>
      <ClubSearch />
    </UPageBody>
  </UPage>
</template>

<style></style>
