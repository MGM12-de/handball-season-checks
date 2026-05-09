<script lang="ts" setup>
import { useFavorites } from '~/composables/useFavorites'

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

const { isFavoriteClub, toggleFavoriteClub } = useFavorites()

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
</script>

<template>
  <div>
    <UPage>
      <UPageHeader :headline="t('clubDetails')" :title="club.name">
        <template #links>
          <UButton
            :icon="isFavoriteClub(clubId) ? 'i-heroicons-star-solid' : 'i-heroicons-star'"
            :color="isFavoriteClub(clubId) ? 'primary' : 'gray'"
            variant="ghost"
            size="xl"
            :title="isFavoriteClub(clubId) ? t('removeFromFavorites') : t('addToFavorites')"
            @click="toggleFavoriteClub({ id: clubId, name: club.name, logo: club.logo, acronym: club.acronym, organizationName: club.organization?.name })"
          />
        </template>
      </UPageHeader>
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
