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

const { data } = await useAsyncData(
  `club/${clubId}`,
  () => $fetch('/api/dhb/club', {
    query: { id: clubId },
  }),
)
club.value = data.value

useSeoMeta({
  title: club.value.name,
  ogImageUrl: club.value.logo,
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
