<script lang="ts" setup>
const { t } = useI18n()
const route = useRoute()
const requestURL = useRequestURL()

const seoTitle = computed(() => t('siteTitle'))
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

const links = computed(() => [
  {
    label: t('searchClub'),
    to: '/club',
    icon: 'i-lucide-search',
  },
  {
    label: t('searchTournament'),
    to: '/tournament',
    icon: 'i-lucide-search',
  },
  {
    label: t('visitOriginalSite'),
    to: 'https://handball.net',
    trailingIcon: 'i-lucide-arrow-right',
    variant: 'subtle' as const,
    color: 'neutral' as const,
    target: '_blank',
  },
])
</script>

<template>
  <UPage>
    <UPageHero :headline="t('handball')" :title="t('siteTitle')" :description="t('siteDescription')" :links="links"
      orientation="horizontal" class="py-8 sm:py-16">
      <AppLogo class="rounded-lg shadow-2xl ring ring-(--ui-border) w-full max-w-xs mx-auto sm:max-w-none" />
    </UPageHero>
  </UPage>
</template>
