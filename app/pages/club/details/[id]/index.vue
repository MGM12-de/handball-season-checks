<script lang="ts" setup>
const route = useRoute()
const clubId = route.params.id as string
const club = ref({
  id: '',
  name: '',
  logo: '',
  acronym: '',
  organization: {
    name: '',
    logo: '',
    acronym: '',
  },
})

const { t } = useI18n()
const requestURL = useRequestURL()

const { data } = await useAsyncData(
  `club/${clubId}`,
  () => $fetch('/api/dhb/club', {
    query: { id: clubId },
  }),
)
club.value = data.value

const seoTitle = computed(() => {
  const clubName = club.value?.name || t('clubDetails')
  return `${clubName} | ${t('siteTitle')}`
})

const seoDescription = computed(() => {
  const clubName = club.value?.name
  const organizationName = club.value?.organization?.name

  if (clubName && organizationName) {
    return `${clubName} · ${organizationName}`
  }

  return t('searchClubDescription')
})

const canonicalUrl = computed(() => new URL(route.fullPath, requestURL.origin).toString())
const ogImage = computed(() => club.value?.logo || club.value?.organization?.logo || undefined)

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
</script>

<template>
  <div>
    <UPage>
      <UPageHeader :headline="t('clubDetails')" :title="club.name" />
      <UPageBody>
        <ClubHeader :club="club" />
        <br> <br>
        <UButton :label="t('lineup')" icon="i-lucide-users" @click="navigateTo(`/club/details/${club.id}/lineup`)" />

        <TeamTable :club-id="club.id" />
      </UPageBody>
    </UPage>
  </div>
</template>

<style></style>
