<script lang="ts" setup>
const props = defineProps({
  club: {
    type: Object,
    required: true,
  },
})
const { t } = useI18n()
const memberClubs = ref<{ id: number, name: string }[]>([])
const { club } = props

if (club.hasMemberClubs) {
  useAsyncData(
    `club/${club.id}/memberClubs`,
    () => $fetch('/api/dhb/club/memberClubs', {
      query: { id: club.id },
    }),
  ).then(
    (response) => {
      memberClubs.value = response.data as unknown as { id: number, name: string }[]
    },
  )
}
</script>

<template>
  <div>
    <UPageCard :title="club.acronym" :description="club.organization.name" orientation="horizontal">
      <!-- <NuxtImg :src="club.logo" width="200" height="100" /> -->
      <UAvatarGroup size="2xl">
        <UAvatar :src="club.organization.logo" :alt="club.organization.acronym" />
        <UAvatar :src="club.logo" :alt="club.acronym" />
      </UAvatarGroup>
      <div v-if="club.hasMemberClubs">
        <h2>{{ t('memberClubs') }}</h2>
        <div v-for="member in memberClubs" :key="member.id">
          <span>{{ member.name }}</span>
        </div>
      </div>
      <ClubInfo :club="club" />
    </UPageCard>
  </div>
</template>

<style></style>
